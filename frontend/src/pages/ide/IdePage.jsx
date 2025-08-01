import React, { useReducer, useEffect } from 'react';
import Header from '../../components/Header';
import FileExplorer from '../../components/FileExplorer';
import Editor from '../../components/Editor';
import OutputConsole from '../../components/OutputConsole';
import ErrorBoundary from '../../components/ErrorBoundary';
import axiosInstance from '../../api/axiosInstance';
import { fileTreeReducer, initialState, actionTypes } from '../../fileTreeReducer';
import './IdePage.css';

const IdePage = () => {
    const [state, dispatch] = useReducer(fileTreeReducer, initialState);
    const { fileTree, activeFile, expandedFolders, creatingNode } = state;

    // Fetch initial file tree
    useEffect(() => {
        const fetchFileTree = async () => {
            try {
                const response = await axiosInstance.get('/files/root');
                dispatch({ type: actionTypes.SET_TREE, payload: response.data ? [response.data] : [] });
            } catch (error) {
                console.error("Failed to fetch file tree:", error);
                dispatch({ type: actionTypes.SET_TREE, payload: [] });
            }
        };
        fetchFileTree();
    }, []);

    const handleFileSelect = (file) => {
        dispatch({ type: actionTypes.SET_ACTIVE_FILE, payload: file });
    };

    const handleFolderToggle = (folderId) => {
        dispatch({ type: actionTypes.TOGGLE_FOLDER, payload: folderId });
    };

    const handleInitiateCreation = (type, parentId = null) => {
        dispatch({ type: actionTypes.INITIATE_CREATION, payload: { type, parentId } });
    };

    const handleFinalizeCreation = (name) => {
        if (!creatingNode) return;

        const newNode = {
            id: Date.now().toString(), // Temporary ID, should be replaced by server response
            name,
            type: creatingNode.type,
            ...(creatingNode.type === 'folder' && { children: [] }),
        };

        dispatch({ type: actionTypes.ADD_NODE, payload: { parentId: creatingNode.parentId, newNode } });
    };

    const handleCancelCreation = () => {
        dispatch({ type: actionTypes.CANCEL_CREATION });
    };

    const handleDeleteNode = (nodeId) => {
        dispatch({ type: actionTypes.REMOVE_NODE, payload: nodeId });
    };

    const handleMoveNode = (sourceId, destinationId) => {
        dispatch({ type: actionTypes.MOVE_NODE, payload: { sourceId, destinationId } });
    };

    const handleEditorChange = (newContent) => {
        if (activeFile) {
            dispatch({ type: actionTypes.UPDATE_NODE_CONTENT, payload: { fileId: activeFile.id, newContent } });
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
