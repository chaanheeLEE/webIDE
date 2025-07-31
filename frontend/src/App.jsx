import React, { useState, useCallback, useEffect, useRef, useReducer } from 'react';
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
import { fileTreeReducer, initialState, actionTypes } from './fileTreeReducer';

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
  const [state, dispatch] = useReducer(fileTreeReducer, initialState);
  const { fileTree, activeFile, expandedFolders, creatingNode } = state;
  const [output, setOutput] = useState('');

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
        dispatch({ type: actionTypes.SET_TREE, payload: [rootNode] });
        dispatch({ type: actionTypes.SET_EXPANDED_FOLDERS, payload: new Set([rootNode.id]) });
      } catch (error) {
        console.error("Error fetching file tree:", error);
      }
    };

    fetchFileTree();
  }, []);


  const handleFileSelect = useCallback((file) => {
    if (file.type === 'file') {
      dispatch({ type: actionTypes.SET_ACTIVE_FILE, payload: file });
    }
  }, []);

  const handleFolderToggle = useCallback((folderId) => {
    dispatch({ type: actionTypes.TOGGLE_FOLDER, payload: folderId });
  }, []);

  const handleInitiateCreation = (type) => {
    let parentId = null;
    if (activeFile) {
       const pathParts = activeFile.path.split('/');
       pathParts.pop();
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
    dispatch({ type: actionTypes.INITIATE_CREATION, payload: { type, parentId } });
  };

  const handleCancelCreation = () => {
    dispatch({ type: actionTypes.CANCEL_CREATION });
  };

  const handleFinalizeCreation = async (name) => {
    if (!name || !creatingNode) {
      dispatch({ type: actionTypes.CANCEL_CREATION });
      return;
    }

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
      parentPath = fileTree.length > 0 ? fileTree[0].path : null;
    }

    if (parentPath === null) {
      console.error("Could not find parent path to create node.");
      dispatch({ type: actionTypes.CANCEL_CREATION });
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
      dispatch({ type: actionTypes.ADD_NODE, payload: { parentId: creatingNode.parentId, newNode } });

    } catch (error) {
      console.error(`Error creating ${creatingNode.type}:`, error);
      dispatch({ type: actionTypes.CANCEL_CREATION });
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

      dispatch({ type: actionTypes.REMOVE_NODE, payload: nodeId });

    } catch (error) {
      console.error("Error deleting node:", error);
    }
  };

  const handleMoveNode = async (sourceId, destinationId) => {
    const findNode = (nodes, id) => {
      for (const node of nodes) {
        if (node.id === id) return node;
        if (node.children) {
          const found = findNode(node.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    const sourceNode = findNode(fileTree, sourceId);
    const destinationNode = findNode(fileTree, destinationId);

    if (!sourceNode || !destinationNode || destinationNode.type !== 'folder') {
      console.error("Invalid source or destination for move.");
      return;
    }

    const requestBody = {
      sourcePath: sourceNode.path,
      destinationPath: destinationNode.path,
    };

    try {
      const response = await fetch('http://localhost:8080/api/files/move', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to move node: ${errorText}`);
      }
      
      // Dispatch move action to update UI
      dispatch({ type: actionTypes.MOVE_NODE, payload: { sourceId, destinationId } });

    } catch (error) {
      console.error("Error moving node:", error);
      // Optionally: show an error message to the user
    }
  };


  const debounceTimeoutRef = useRef(null);

  const handleContentChange = useCallback((newContent) => {
    if (!activeFile || activeFile.content === newContent) {
      return;
    }

    dispatch({ type: actionTypes.UPDATE_NODE_CONTENT, payload: { fileId: activeFile.id, newContent } });

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/files/content?path=${encodeURIComponent(activeFile.path)}`, {
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
        
        console.log(`File ${activeFile.name} saved successfully.`);
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
