import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from 'react-resizable-panels';

import Header from './components/Header';
import FileExplorer from './components/FileExplorer';
import Editor from './Editor';
import OutputConsole from './components/OutputConsole';
import HELLO_WORLD_SNIPPETS from './helloWorldSnippets';

// This will be replaced by data from the backend
const initialFileTree = [];

// Piston API supported language versions (example versions, might need updates)
const languageVersions = {
  cpp: '10.2.0',
  css: '3.3.3', // This is a placeholder, CSS is not executed
  html: '5', // This is a placeholder, HTML is not executed
  java: '15.0.2',
  javascript: '18.15.0',
  json: '1.0.0', // Placeholder
  markdown: '1.0.0', // Placeholder
  python: '3.10.0',
  sql: '3.36.0', // SQLite version
  yaml: '1.2', // Placeholder
  // Add other languages and versions as needed
};

function App() {
  const [fileTree, setFileTree] = useState(initialFileTree);
  const [activeFile, setActiveFile] = useState(null);
  const [output, setOutput] = useState('');
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [creatingNode, setCreatingNode] = useState(null); // { type: 'file' | 'folder', parentId: string | null }

  // Fetch initial file tree from backend
  useEffect(() => {
    const seedInitialData = async () => {
      try {
        console.log("Seeding initial data...");
        // 1. Create root directory
        const rootResponse = await fetch('http://localhost:8080/api/files/root', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'project' })
        });
        if (!rootResponse.ok) throw new Error('Failed to create root directory');
        const rootNode = await rootResponse.json();
        const parentPath = rootNode.path;

        // 2. Create snippet files inside the root
        for (const [lang, code] of Object.entries(HELLO_WORLD_SNIPPETS)) {
          let fileName = `hello.${lang}`;
          if (lang === 'java') fileName = 'Main.java';
          if (lang === 'html') fileName = 'index.html';
          
          await fetch('http://localhost:8080/api/files', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ parentPath, name: fileName, content: code }),
          });
        }
        console.log("Initial data seeded successfully.");
      } catch (error) {
        console.error("Error seeding data:", error);
      }
    };

    const fetchFileTree = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/files/root');
        if (response.status === 404) {
          await seedInitialData();
          await fetchFileTree(); // Retry fetching after seeding
          return;
        }
        if (!response.ok) {
          throw new Error('Failed to fetch file tree');
        }
        const rootNode = await response.json();
        setFileTree([rootNode]);
        setExpandedFolders(new Set([rootNode.id]));
      } catch (error) {
        console.error("Error fetching file tree:", error);
      }
    };

    fetchFileTree();
  }, []);


  const handleFileSelect = useCallback((file) => {
    if (file.type === 'file') {
      setActiveFile(file);
    }
  }, []);

  const handleFolderToggle = useCallback((folderId) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  }, []);

  const handleInitiateCreation = (type) => {
    let parentId = null;

    // Find parent from the currently active file's path
    if (activeFile) {
       // This is a simplification. A robust solution would find the parent ID from the activeFile's ID.
       // For now, we find the parent path and then its ID.
       const pathParts = activeFile.path.split('/');
       pathParts.pop(); // Remove file name
       const parentPath = pathParts.join('/');
       
       const findId = (nodes, p) => {
         for (const node of nodes) {
           if (node.path === p) return node.id;
           if (node.children) {
             const foundId = findId(node.children, p);
             if (foundId) return foundId;
           }
         }
         return null;
       }
       parentId = findId(fileTree, parentPath);
    }
    
    // If no active file, or want to create at root, parentId remains null.
    // The creation logic will then use the root node as the parent.
    
    setCreatingNode({ type, parentId });
    
    if (parentId) {
      setExpandedFolders(prev => new Set(prev).add(parentId));
    }
  };

  const handleCancelCreation = () => {
    setCreatingNode(null);
  };

  const handleFinalizeCreation = async (name) => {
    if (!name || !creatingNode) {
      setCreatingNode(null);
      return;
    }

    // Find parent path from parentId
    let parentPath = null;
    if (creatingNode.parentId) {
      const findPath = (nodes, id) => {
        for (const node of nodes) {
          if (node.id === id) return node.path;
          if (node.children) {
            const foundPath = findPath(node.children, id);
            if (foundPath) return foundPath;
          }
        }
        return null;
      };
      parentPath = findPath(fileTree, creatingNode.parentId);
    } else {
      // Assume root is the parent if no parentId
      parentPath = fileTree.length > 0 ? fileTree[0].path : null;
    }

    if (parentPath === null) {
      console.error("Could not find parent path to create node.");
      setCreatingNode(null);
      return;
    }

    const url = creatingNode.type === 'file' 
      ? 'http://localhost:8080/api/files' 
      : 'http://localhost:8080/api/files/directories';
    
    const requestBody = {
      parentPath,
      name,
      content: creatingNode.type === 'file' ? '' : undefined,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create node: ${errorText}`);
      }

      const newNode = await response.json();

      // Add the new node to the file tree in the state
      const addToTree = (nodes, pId, nNode) => {
        return nodes.map(node => {
          if (node.id === pId) {
            return { ...node, children: [...(node.children || []), nNode] };
          }
          if (node.children) {
            return { ...node, children: addToTree(node.children, pId, nNode) };
          }
          return node;
        });
      };
      
      if (creatingNode.parentId) {
        setFileTree(prevTree => addToTree(prevTree, creatingNode.parentId, newNode));
      } else {
        // This case might need adjustment if root is not the direct parent
        setFileTree(prevTree => [...prevTree, newNode]);
      }

    } catch (error) {
      console.error(`Error creating ${creatingNode.type}:`, error);
    } finally {
      setCreatingNode(null);
    }
  };

  const handleDeleteNode = async (path, nodeId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/files?path=${encodeURIComponent(path)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete node: ${errorText}`);
      }

      // If API call is successful, update the frontend state
      const removeNode = (nodes, id) => {
        return nodes.filter(node => node.id !== id).map(node => {
          if (node.children) {
            node.children = removeNode(node.children, id);
          }
          return node;
        });
      };

      setFileTree(prevTree => removeNode(prevTree, nodeId));

      if (activeFile && activeFile.id === nodeId) {
        setActiveFile(null);
      }

    } catch (error) {
      console.error("Error deleting node:", error);
      // Optionally, show an error message to the user
    }
  };

  const handleMoveNode = (sourceId, destinationId) => {
    let sourceNode = null;

    // Deep copy to avoid direct state mutation
    const newTree = JSON.parse(JSON.stringify(fileTree));

    // Helper to find and remove the source node
    const findAndRemove = (nodes, id) => {
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node.id === id) {
          sourceNode = node;
          nodes.splice(i, 1); // Remove node from its original parent
          return true;
        }
        if (node.children) {
          if (findAndRemove(node.children, id)) return true;
        }
      }
      return false;
    };

    // Helper to find the destination and add the source node
    const findAndAdd = (nodes, id) => {
      for (const node of nodes) {
        if (node.id === id && node.type === 'folder') {
          node.children.push(sourceNode);
          return true;
        }
        if (node.children) {
          if (findAndAdd(node.children, id)) return true;
        }
      }
      return false;
    };

    findAndRemove(newTree, sourceId);

    if (sourceNode) {
      findAndAdd(newTree, destinationId);
      setFileTree(newTree);
    }
  };


  const debounceTimeoutRef = useRef(null);

  const handleContentChange = useCallback((newContent) => {
    if (!activeFile || activeFile.content === newContent) {
      return;
    }

    // Use a variable to hold the latest state to avoid stale closures in setTimeout
    const updatedActiveFile = { ...activeFile, content: newContent };

    // Update UI state immediately for responsiveness
    setActiveFile(updatedActiveFile);

    const updateNodeInTree = (nodes, fileId, content) => {
      return nodes.map(node => {
        if (node.id === fileId) {
          return { ...node, content };
        }
        if (node.children) {
          return { ...node, children: updateNodeInTree(node.children, fileId, content) };
        }
        return node;
      });
    };
    setFileTree(prevTree => updateNodeInTree(prevTree, activeFile.id, newContent));

    // Clear the previous debounce timer
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set a new timer to save the content after a delay
    debounceTimeoutRef.current = setTimeout(async () => {
      // Use the updated file info in the closure
      try {
        const response = await fetch(`http://localhost:8080/api/files/content?path=${encodeURIComponent(updatedActiveFile.path)}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content: newContent }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to save content: ${errorText}`);
        }
        
        console.log(`File ${updatedActiveFile.name} saved successfully.`);
      } catch (error) {
        console.error("Error saving file:", error);
      }
    }, 1500);
  }, [activeFile]);

  // Cleanup the timer when the component unmounts
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const handleRunCode = async () => {
    if (!activeFile) {
      setOutput('Please select a file to run.');
      return;
    }

    setOutput('Executing code...');

    const extension = activeFile.name.split('.').pop();
    const language = extension === 'jsx' ? 'javascript' : extension;
    const version = languageVersions[language];

    if (!version) {
      setOutput(`Execution for .${extension} files is not supported or version is not configured.`);
      return;
    }

    const requestBody = {
      language: language,
      version: version,
      code: activeFile.content,
      filename: activeFile.name,
    };

    try {
      const response = await fetch('http://localhost:8080/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: '서버에서 알 수 없는 에러가 발생했습니다.' }));
        // BusinessException으로부터 오는 커스텀 에러 메시지 추출
        const errorMessage = errorData.message || '에러 메시지가 없습니다.';
        throw new Error(errorMessage);
      }

      const result = await response.json();

      if (result.success) {
        setOutput(result.output);
      } else {
        setOutput(`Error:\n${result.error}`);
      }
    } catch (error) {
      // 사용자에게 에러 메시지를 알림으로 표시
      alert(error.message);
      // 콘솔 초기화
      setOutput('');
    }
  };

  const executableExtensions = new Set(['cpp', 'java', 'javascript', 'jsx', 'python']);
  const currentExtension = activeFile?.name.split('.').pop();
  const isRunDisabled = !activeFile || !executableExtensions.has(currentExtension);

  return (
    <div className="app-container">
      <Header onRun={handleRunCode} isRunDisabled={isRunDisabled} />
      <main className="main-content">
        <PanelGroup direction="horizontal">
          <Panel defaultSize={20} minSize={15} maxSize={40}>
            <FileExplorer 
              fileTree={fileTree} 
              activeFile={activeFile}
              expandedFolders={expandedFolders}
              creatingNode={creatingNode}
              onFileSelect={handleFileSelect}
              onFolderToggle={handleFolderToggle}
              onInitiateCreation={handleInitiateCreation}
              onFinalizeCreation={handleFinalizeCreation}
              onCancelCreation={handleCancelCreation}
              onDeleteNode={handleDeleteNode}
              onMoveNode={handleMoveNode}
            />
          </Panel>
          <PanelResizeHandle className="resize-handle" />
          <Panel>
            <PanelGroup direction="vertical">
              <Panel defaultSize={70} minSize={30}>
                <Editor 
                  activeFile={activeFile}
                  onChange={handleContentChange}
                />
              </Panel>
              <PanelResizeHandle className="resize-handle" />
              <Panel defaultSize={30} minSize={10}>
                <OutputConsole output={output} />
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </main>
    </div>
  );
}

export default App;
