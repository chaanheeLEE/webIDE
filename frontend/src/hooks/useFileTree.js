import { useReducer, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';
import { fileTreeReducer, initialState, actionTypes } from '../fileTreeReducer';
import { createFile, createDirectory, deleteNode, moveNode, renameNode, updateFileContent } from '../api/fileApi';
import { getMemberInfo } from '../api/memberApi';
import { getProjectDetails } from '../api/projectApi';

export const useFileTree = (projectId, isReadOnly = false) => {
    const [state, dispatch] = useReducer(fileTreeReducer, initialState);
    const { fileTree, activeFile, expandedFolders, creatingNode } = state;

    useEffect(() => {
        const fetchFileTree = async () => {
            try {
                let response;
                
                // 먼저 프로젝트 소유권을 확인
                try {
                    const currentUserInfo = await getMemberInfo();
                    const projectInfo = await getProjectDetails(projectId);
                    
                    const isOwner = currentUserInfo.email === projectInfo.memberEmail;
                    
                    if (isOwner) {
                        // 소유자일 때는 기존 API 사용
                        response = await axiosInstance.get(`/projects/${projectId}/files/root`);
                    } else {
                        // 읽기 전용 모드일 때는 공개 API 사용
                        response = await axiosInstance.get(`/projects/${projectId}/files/root/public`);
                    }
                } catch (authError) {
                    // 인증 오류가 발생하면 공개 API로 시도
                    console.warn("Authentication failed, trying public API:", authError);
                    response = await axiosInstance.get(`/projects/${projectId}/files/root/public`);
                }
                
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

    const findNodePath = (nodes, nodeId) => {
        for (const node of nodes) {
            if (node.id === nodeId) {
                return node.path;
            }
            if (node.children) {
                const foundPath = findNodePath(node.children, nodeId);
                if (foundPath) {
                    return foundPath;
                }
            }
        }
        return null;
    };

    const handleFinalizeCreation = useCallback(async (name) => {
        if (!creatingNode) return;

        const findParentNode = (nodes, parentId) => {
            if (!parentId) {
                // 루트에 생성하는 경우, 가상의 부모 노드를 반환
                return { children: nodes };
            }
            for (const node of nodes) {
                if (node.id === parentId) {
                    return node;
                }
                if (node.children) {
                    const found = findParentNode(node.children, parentId);
                    if (found) return found;
                }
            }
            return null;
        };

        const parentNode = findParentNode(fileTree, creatingNode.parentId);
        const siblings = parentNode ? parentNode.children || [] : fileTree;

        const isDuplicate = siblings.some(child => child.name === name);

        if (isDuplicate) {
            alert(`A file or folder with the name "${name}" already exists in this location.`);
            dispatch({ type: actionTypes.CANCEL_CREATION });
            return;
        }

        const parentPath = creatingNode.parentId 
            ? findNodePath(fileTree, creatingNode.parentId)
            : findRootDirectory()?.path;

        if (!parentPath) {
            console.error("Parent path not found");
            return;
        }

        try {
            let newNode;
            if (creatingNode.type === 'file') {
                newNode = await createFile({ parentPath, name, content: '' });
            } else {
                newNode = await createDirectory({ parentPath, name });
            }
            dispatch({ type: actionTypes.ADD_NODE, payload: { parentId: creatingNode.parentId, newNode } });
        } catch (error) {
            console.error("Failed to create node:", error);
        }
    }, [creatingNode, fileTree, findRootDirectory]);

    const handleCancelCreation = useCallback(() => {
        dispatch({ type: actionTypes.CANCEL_CREATION });
    }, []);

    const handleDeleteNode = useCallback(async (path, nodeId) => {
        try {
            await deleteNode(path);
            dispatch({ type: actionTypes.REMOVE_NODE, payload: nodeId });
        } catch (error) {
            console.error("Failed to delete node:", error);
        }
    }, []);

    const handleMoveNode = useCallback(async (sourceId, destinationId) => {
        const sourcePath = findNodePath(fileTree, sourceId);
        const destinationPath = findNodePath(fileTree, destinationId);

        if (!sourcePath || !destinationPath) {
            console.error("Source or destination path not found");
            return;
        }

        try {
            await moveNode({ sourcePath, destinationPath });
            // Optimistically update UI, or refetch tree
            dispatch({ type: actionTypes.MOVE_NODE, payload: { sourceId, destinationId } });
        } catch (error) {
            console.error("Failed to move node:", error);
        }
    }, [fileTree]);

    const handleRenameNode = useCallback(async (path, nodeId, newName) => {
        const findNodeAndParent = (nodes, id, parent = null) => {
            for (const node of nodes) {
                if (node.id === id) {
                    return { node, parent };
                }
                if (node.children) {
                    const found = findNodeAndParent(node.children, id, node);
                    if (found) return found;
                }
            }
            return null;
        };

        const { parent } = findNodeAndParent(fileTree, nodeId) || {};
        const siblings = parent ? parent.children || [] : fileTree;
        const isDuplicate = siblings.some(child => child.id !== nodeId && child.name === newName);

        if (isDuplicate) {
            alert(`A file or folder with the name "${newName}" already exists in this location.`);
            return;
        }

        try {
            await renameNode({ path, newName });
            dispatch({ type: actionTypes.RENAME_NODE, payload: { nodeId, newName } });
        } catch (error) {
            console.error("Failed to rename node:", error);
        }
    }, [fileTree]);

    const handleEditorChange = useCallback(async (newContent) => {
        if (activeFile) {
            dispatch({ type: actionTypes.UPDATE_NODE_CONTENT, payload: { fileId: activeFile.id, newContent } });
            try {
                await updateFileContent({ path: activeFile.path, content: newContent });
            } catch (error) {
                console.error('Failed to save file content:', error);
            }
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
