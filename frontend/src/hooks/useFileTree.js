import { useReducer, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';
import { fileTreeReducer, initialState, actionTypes } from '../fileTreeReducer';

export const useFileTree = (projectId) => {
    const [state, dispatch] = useReducer(fileTreeReducer, initialState);
    const { fileTree, activeFile, expandedFolders, creatingNode } = state;

    useEffect(() => {
        const fetchFileTree = async () => {
            try {
                const response = await axiosInstance.get(`/projects/${projectId}/files/root`);
                dispatch({ type: actionTypes.SET_TREE, payload: response.data ? [response.data] : [] });
            } catch (error) {
                console.error("Failed to fetch file tree:", error);
                dispatch({ type: actionTypes.SET_TREE, payload: [] });
            }
        };
        
        if (projectId) {
            fetchFileTree();
        }
    }, [projectId]);

    const findRootDirectory = useCallback(() => {
        if (!Array.isArray(fileTree) || fileTree.length === 0) return null;
        return fileTree[0];
    }, [fileTree]);

    const handleFileSelect = useCallback((file) => {
        dispatch({ type: actionTypes.SET_ACTIVE_FILE, payload: file });
    }, []);

    const handleFolderToggle = useCallback((folderId) => {
        dispatch({ type: actionTypes.TOGGLE_FOLDER, payload: folderId });
    }, []);

    const handleInitiateCreation = useCallback((type, parentId = null) => {
        if (parentId === null) {
            const rootDir = findRootDirectory();
            if (rootDir) {
                parentId = rootDir.id;
            }
        }
        dispatch({ type: actionTypes.INITIATE_CREATION, payload: { type, parentId } });
    }, [findRootDirectory]);

    const handleFinalizeCreation = useCallback((name) => {
        if (!creatingNode) return;

        const newNode = {
            id: Date.now().toString(),
            name,
            type: creatingNode.type,
            ...(creatingNode.type === 'folder' && { children: [] }),
        };

        dispatch({ type: actionTypes.ADD_NODE, payload: { parentId: creatingNode.parentId, newNode } });
    }, [creatingNode]);

    const handleCancelCreation = useCallback(() => {
        dispatch({ type: actionTypes.CANCEL_CREATION });
    }, []);

    const handleDeleteNode = useCallback((path, nodeId) => {
        dispatch({ type: actionTypes.REMOVE_NODE, payload: nodeId });
    }, []);

    const handleMoveNode = useCallback((sourceId, destinationId) => {
        dispatch({ type: actionTypes.MOVE_NODE, payload: { sourceId, destinationId } });
    }, []);

    const handleRenameNode = useCallback((path, nodeId, newName) => {
        dispatch({ type: actionTypes.RENAME_NODE, payload: { nodeId, newName } });
    }, []);

    const handleEditorChange = useCallback((newContent) => {
        if (activeFile) {
            dispatch({ type: actionTypes.UPDATE_NODE_CONTENT, payload: { fileId: activeFile.id, newContent } });
        }
    }, [activeFile]);

    return {
        fileTree,
        activeFile,
        expandedFolders,
        creatingNode,
        handleFileSelect,
        handleFolderToggle,
        handleInitiateCreation,
        handleFinalizeCreation,
        handleCancelCreation,
        handleDeleteNode,
        handleMoveNode,
        handleRenameNode,
        handleEditorChange,
    };
};
