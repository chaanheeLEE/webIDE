import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import FileExplorer from '../../components/FileExplorer';
import Editor from '../../components/Editor';
import OutputConsole from '../../components/OutputConsole';
import ErrorBoundary from '../../components/ErrorBoundary';
import axiosInstance from '../../api/axiosInstance';
import './IdePage.css';

const IdePage = () => {
    const [fileTree, setFileTree] = useState([]);
    const [activeFile, setActiveFile] = useState(null);
    const [expandedFolders, setExpandedFolders] = useState(new Set());
    const [creatingNode, setCreatingNode] = useState(null); // { type: 'file' | 'folder', parentId: string | null }

    // Fetch initial file tree
    useEffect(() => {
        const fetchFileTree = async () => {
            try {
                // Assuming you have an endpoint to get the whole tree or root
                const response = await axiosInstance.get('/files/root'); 
                setFileTree(response.data ? [response.data] : []);
            } catch (error) {
                console.error("Failed to fetch file tree:", error);
                setFileTree([]); // Set to empty array on error
            }
        };
        fetchFileTree();
    }, []);

    const handleFileSelect = (file) => {
        setActiveFile(file);
    };

    const handleFolderToggle = (folderId) => {
        setExpandedFolders(prev => {
            const newSet = new Set(prev);
            if (newSet.has(folderId)) {
                newSet.delete(folderId);
            } else {
                newSet.add(folderId);
            }
            return newSet;
        });
    };
    
    // Placeholder functions for file operations
    const handleInitiateCreation = (type, parentId = null) => console.log("Initiate creation:", type, parentId);
    const handleFinalizeCreation = (name) => console.log("Finalize creation:", name);
    const handleCancelCreation = () => console.log("Cancel creation");
    const handleDeleteNode = (path, nodeId) => console.log("Delete node:", path, nodeId);
    const handleMoveNode = (sourceId, targetId) => console.log("Move node:", sourceId, "to", targetId);
    const handleEditorChange = (value, viewUpdate) => {
        if (activeFile) {
            // This is where you'd handle saving the file content, maybe with a debounce
            // For now, just update the local state
            setActiveFile(prev => ({ ...prev, content: value }));
        }
    };


    return (
        <div className="main-layout">
            <Header />
            <div className="content-area">
                <div className="sidebar">
                    <ErrorBoundary>
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
                    </ErrorBoundary>
                </div>
                <div className="main-content">
                    <Editor activeFile={activeFile} onChange={handleEditorChange} />
                    <OutputConsole />
                </div>
            </div>
        </div>
    );
};

export default IdePage;