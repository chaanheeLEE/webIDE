import React, { useState } from 'react';
import {
  VscFolder,
  VscFolderOpened,
  VscFile,
  VscJson,
  VscNewFile,
  VscNewFolder,
  VscTrash,
  VscDatabase,
} from 'react-icons/vsc';
import { FaJava } from 'react-icons/fa';
import {
  SiJavascript,
  SiTypescript,
  SiCss3,
  SiHtml5,
  SiPython,
  SiCplusplus,
  SiYaml,
  SiMarkdown,
} from 'react-icons/si';
import CreationInput from './CreationInput';
import './FileExplorer.css';

const getFileIcon = (fileName) => {
  const extension = fileName.split('.').pop();
  switch (extension) {
    case 'js':
    case 'jsx':
    case 'javascript':
      return <SiJavascript color="#f7df1e" />;
    case 'ts':
    case 'tsx':
      return <SiTypescript color="#3178c6" />;
    case 'css':
      return <SiCss3 color="#1572b6" />;
    case 'html':
      return <SiHtml5 color="#e34f26" />;
    case 'json':
      return <VscJson color="#f7df1e" />;
    case 'py':
    case 'python':
      return <SiPython color="#3776ab" />;
    case 'java':
      return <FaJava color="#007396" />;
    case 'cpp':
      return <SiCplusplus color="#00599c" />;
    case 'sql':
      return <VscDatabase color="#d87f32" />;
    case 'yaml':
    case 'yml':
      return <SiYaml color="#cb171e" />;
    case 'md':
    case 'markdown':
      return <SiMarkdown color="#ffffff" />;
    default:
      return <VscFile />;
  }
};

const TreeNode = ({ node, path, activeFile, expandedFolders, onFileSelect, onFolderToggle, onDeleteNode, onMoveNode, onRenameNode, fileTree, isReadOnly }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(node.name);
  
  // 백엔드에서 오는 FileType enum 값들과 프론트엔드에서 생성하는 값들을 모두 처리
  const isFolder = node.type === 'folder' || 
                   node.type === 'directory' || 
                   node.type === 'DIRECTORY';
  const isExpanded = isFolder && expandedFolders.has(node.id);
  const isSelected = activeFile && activeFile.id === node.id;

  const handleNodeClick = (e) => {
    e.stopPropagation();
    if (isFolder) {
      onFolderToggle(node.id);
    } else {
      onFileSelect({ ...node, path }); // Pass path along with node
    }
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${node.name}"?`)) {
      onDeleteNode(path, node.id);
    }
  };

  // 프로젝트의 실제 루트 디렉토리인지 확인 (fileTree의 첫 번째 노드이면서 parentId가 없는 경우)
  const isProjectRootDirectory = !node.parentId && Array.isArray(fileTree) && fileTree.length > 0 && fileTree[0].id === node.id;

  const handleRenameClick = (e) => {
    e.stopPropagation();
    setIsRenaming(true);
    setNewName(node.name);
  };

  const handleRenameKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (newName.trim() && newName.trim() !== node.name) {
        onRenameNode(path, node.id, newName.trim());
      }
      setIsRenaming(false);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsRenaming(false);
      setNewName(node.name);
    }
  };

  const handleRenameBlur = () => {
    if (newName.trim() && newName.trim() !== node.name) {
      onRenameNode(path, node.id, newName.trim());
    }
    setIsRenaming(false);
  };

  // --- Drag and Drop Handlers ---
  const handleDragStart = (e) => {
    e.stopPropagation();
    e.dataTransfer.setData('application/node-id', node.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const findNodeById = (nodes, id) => {
    for (const n of nodes) {
      if (n.id === id) return n;
      if (n.children) {
        const found = findNodeById(n.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const isDescendant = (sourceNode, targetNode) => {
    if (!sourceNode || !targetNode) return false;
    if (targetNode.id === sourceNode.id) return true;
    if (targetNode.children) {
      for (const child of targetNode.children) {
        const newTarget = findNodeById(fileTree, child.id);
        if (isDescendant(sourceNode, newTarget)) return true;
      }
    }
    return false;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFolder) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // 자식 요소로 이동하는 경우를 제외하고 dragOver 상태 해제
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    if (!isFolder) {
      return;
    }

    const sourceId = e.dataTransfer.getData('application/node-id');
    
    if (!sourceId) {
      return;
    }

    const sourceNode = findNodeById(fileTree, sourceId);
    const targetNode = node;

    if (!sourceNode) {
      return;
    }

    if (sourceId === targetNode.id) {
      return;
    }

    if (isDescendant(sourceNode, targetNode)) {
      return;
    }

    // 기본적인 이동 허용 - 복잡한 루트 체크는 일시적으로 제거
    onMoveNode(sourceId, targetNode.id);
  };

  const nodeIcon = isFolder
    ? isExpanded ? <VscFolderOpened /> : <VscFolder />
    : getFileIcon(node.name);

  return (
    <>
      <li
        className={`tree-node ${isSelected ? 'selected' : ''} ${isDragOver ? 'drag-over' : ''}`}
        onClick={handleNodeClick}
        draggable={!isRenaming && !isProjectRootDirectory && !isReadOnly}
        onDragStart={!isReadOnly ? handleDragStart : undefined}
        onDragOver={!isReadOnly ? handleDragOver : undefined}
        onDragLeave={!isReadOnly ? handleDragLeave : undefined}
        onDrop={!isReadOnly ? handleDrop : undefined}
      >
        <span className="node-icon">{nodeIcon}</span>
        {isRenaming ? (
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={handleRenameKeyDown}
            onBlur={handleRenameBlur}
            className="rename-input"
            autoFocus
          />
        ) : (
          <span className="node-name" onDoubleClick={!isReadOnly ? handleRenameClick : undefined}>{node.name}</span>
        )}
        {!isRenaming && !isReadOnly && (
          <div className="node-actions">
            <button className="rename-button" onClick={handleRenameClick} title={`Rename ${node.name}`}>
              ✏️
            </button>
            {!isProjectRootDirectory && (
              <button className="delete-button" onClick={handleDeleteClick} title={`Delete ${node.name}`}>
                <VscTrash />
              </button>
            )}
          </div>
        )}
      </li>
      {isExpanded && Array.isArray(node.children) && (
        <ul className="tree-children">
          {node.children.map((childNode) => (
            <TreeNode
              key={childNode.id}
              node={childNode}
              path={`${path}/${childNode.name}`}
              activeFile={activeFile}
              expandedFolders={expandedFolders}
              onFileSelect={onFileSelect}
              onFolderToggle={onFolderToggle}
              onDeleteNode={onDeleteNode}
              onMoveNode={onMoveNode}
              onRenameNode={onRenameNode}
              fileTree={fileTree}
              isReadOnly={isReadOnly}
            />
          ))}
        </ul>
      )}
    </>
  );
};


const FileExplorer = ({ 
  fileTree = [], // Set default prop to an empty array
  activeFile, 
  expandedFolders, 
  creatingNode,
  onFileSelect, 
  onFolderToggle,
  onInitiateCreation,
  onFinalizeCreation,
  onCancelCreation,
  onDeleteNode,
  onMoveNode,
  onRenameNode,
  isReadOnly = false,
}) => {
  return (
    <aside className="file-explorer">
      <div className="explorer-header">
        <h3>Explorer</h3>
        {!isReadOnly && (
          <div className="header-actions">
            <button onClick={() => onInitiateCreation('file')} title="New File">
              <VscNewFile />
            </button>
            <button onClick={() => onInitiateCreation('folder')} title="New Folder">
              <VscNewFolder />
            </button>
          </div>
        )}
      </div>
      <div className="explorer-content">
        <ul className="tree-root">
          {Array.isArray(fileTree) && fileTree.map((node) => (
             <TreeNode
              key={node.id}
              node={node}
              path={node.path} // Assuming root node from backend has a path
              activeFile={activeFile}
              expandedFolders={expandedFolders}
              onFileSelect={onFileSelect}
              onFolderToggle={onFolderToggle}
              onDeleteNode={onDeleteNode}
              onMoveNode={onMoveNode}
              onRenameNode={onRenameNode}
              fileTree={fileTree}
              isReadOnly={isReadOnly}
            />
          ))}
          {creatingNode && !isReadOnly && Array.isArray(fileTree) && fileTree.length > 0 && creatingNode.parentId === fileTree[0].id && (
            <CreationInput 
              type={creatingNode.type}
              onFinalize={onFinalizeCreation}
              onCancel={onCancelCreation}
            />
          )}
        </ul>
      </div>
    </aside>
  );
};

export default FileExplorer;