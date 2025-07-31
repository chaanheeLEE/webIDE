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

const TreeNode = ({ node, path, activeFile, expandedFolders, onFileSelect, onFolderToggle, onDeleteNode, onMoveNode, fileTree }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const isFolder = node.type === 'folder';
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
      const sourceId = e.dataTransfer.getData('application/node-id');
      const sourceNode = findNodeById(fileTree, sourceId);
      const targetNode = node;

      // Prevent dropping a folder into itself or one of its own children
      if (sourceId && sourceId !== targetNode.id && sourceNode && !isDescendant(sourceNode, targetNode)) {
        setIsDragOver(true);
      }
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (isFolder) {
      const sourceId = e.dataTransfer.getData('application/node-id');
      const sourceNode = findNodeById(fileTree, sourceId);
      const targetNode = node;

      if (sourceId && sourceId !== targetNode.id && sourceNode && !isDescendant(sourceNode, targetNode)) {
        onMoveNode(sourceId, targetNode.id);
      }
    }
  };

  const nodeIcon = isFolder
    ? isExpanded ? <VscFolderOpened /> : <VscFolder />
    : getFileIcon(node.name);

  return (
    <>
      <li
        className={`tree-node ${isSelected ? 'selected' : ''} ${isDragOver ? 'drag-over' : ''}`}
        onClick={handleNodeClick}
        draggable={true}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <span className="node-icon">{nodeIcon}</span>
        <span className="node-name">{node.name}</span>
        <button className="delete-button" onClick={handleDeleteClick} title={`Delete ${node.name}`}>
          <VscTrash />
        </button>
      </li>
      {isExpanded && node.children && (
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
              fileTree={fileTree}
            />
          ))}
        </ul>
      )}
    </>
  );
};


const FileExplorer = ({ 
  fileTree, 
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
}) => {
  return (
    <aside className="file-explorer">
      <div className="explorer-header">
        <h3>Explorer</h3>
        <div className="header-actions">
          <button onClick={() => onInitiateCreation('file')} title="New File">
            <VscNewFile />
          </button>
          <button onClick={() => onInitiateCreation('folder')} title="New Folder">
            <VscNewFolder />
          </button>
        </div>
      </div>
      <div className="explorer-content">
        <ul className="tree-root">
          {fileTree.map((node) => (
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
              fileTree={fileTree}
            />
          ))}
          {creatingNode && creatingNode.parentId === null && (
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
