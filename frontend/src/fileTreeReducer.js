// Action Types
export const actionTypes = {
  SET_TREE: 'SET_TREE',
  SAVE_TREE: 'SAVE_TREE', // 파일 트리 저장을 위한 액션 타입 추가
  SET_ACTIVE_FILE: 'SET_ACTIVE_FILE',
  TOGGLE_FOLDER: 'TOGGLE_FOLDER',
  INITIATE_CREATION: 'INITIATE_CREATION',
  CANCEL_CREATION: 'CANCEL_CREATION',
  ADD_NODE: 'ADD_NODE',
  REMOVE_NODE: 'REMOVE_NODE',
  MOVE_NODE: 'MOVE_NODE',
  RENAME_NODE: 'RENAME_NODE',
  UPDATE_NODE_CONTENT: 'UPDATE_NODE_CONTENT',
  SET_EXPANDED_FOLDERS: 'SET_EXPANDED_FOLDERS',
};

// Initial State
export const initialState = {
  fileTree: [],
  activeFile: null,
  expandedFolders: new Set(),
  creatingNode: null, // { type: 'file' | 'folder', parentId: string | null }
};

// Reducer Function
export function fileTreeReducer(state, action) {
  switch (action.type) {
    case actionTypes.SET_TREE:
      return { ...state, fileTree: action.payload };

    case actionTypes.SAVE_TREE:
      // This action doesn't change the state directly.
      // It can be used by middleware to trigger side effects like saving the tree to a server.
      return state;

    case actionTypes.SET_ACTIVE_FILE:
      return { ...state, activeFile: action.payload };

    case actionTypes.TOGGLE_FOLDER: {
      const newSet = new Set(state.expandedFolders);
      if (newSet.has(action.payload)) {
        newSet.delete(action.payload);
      } else {
        newSet.add(action.payload);
      }
      return { ...state, expandedFolders: newSet };
    }
    
    case actionTypes.SET_EXPANDED_FOLDERS:
        return { ...state, expandedFolders: action.payload };

    case actionTypes.INITIATE_CREATION: {
        const { type, parentId } = action.payload;
        const newExpandedFolders = new Set(state.expandedFolders);
        if (parentId) {
            newExpandedFolders.add(parentId);
        }
        return {
            ...state,
            creatingNode: { type, parentId },
            expandedFolders: newExpandedFolders,
        };
    }

    case actionTypes.CANCEL_CREATION:
      return { ...state, creatingNode: null };

    case actionTypes.ADD_NODE: {
      const { parentId, newNode } = action.payload;
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

      let newTree;
      if (parentId) {
        newTree = addToTree(state.fileTree, parentId, newNode);
      } else {
        // parentId가 없으면 루트 디렉토리 내부에 추가
        if (state.fileTree.length > 0) {
          const rootDirectory = state.fileTree[0];
          newTree = addToTree(state.fileTree, rootDirectory.id, newNode);
        } else {
          newTree = [...state.fileTree, newNode];
        }
      }
      return { ...state, fileTree: newTree, creatingNode: null };
    }

    case actionTypes.REMOVE_NODE: {
      const nodeId = action.payload;
      const removeNode = (nodes, id) => {
        return nodes.filter(node => node.id !== id).map(node => {
          if (node.children) {
            node.children = removeNode(node.children, id);
          }
          return node;
        });
      };
      const newTree = removeNode(state.fileTree, nodeId);
      const newActiveFile = state.activeFile && state.activeFile.id === nodeId ? null : state.activeFile;
      return { ...state, fileTree: newTree, activeFile: newActiveFile };
    }

    case actionTypes.MOVE_NODE: {
      const { sourceId, destinationId } = action.payload;
      let sourceNode = null;
      const newTree = JSON.parse(JSON.stringify(state.fileTree));

      const findAndRemove = (nodes, id) => {
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i].id === id) {
            sourceNode = nodes[i];
            sourceNode.parentId = null; // parentId 초기화
            nodes.splice(i, 1);
            return true;
          }
          if (nodes[i].children) {
            if (findAndRemove(nodes[i].children, id)) return true;
          }
        }
        return false;
      };

      const findAndAdd = (nodes, id) => {
        // 루트 디렉토리로 이동하는 경우 (destinationId가 루트 디렉토리의 ID인 경우)
        for (const node of nodes) {
          if (node.id === id && (node.type === 'folder' || node.type === 'directory' || node.type === 'DIRECTORY')) {
            node.children = node.children || [];
            sourceNode.parentId = id; // parentId 업데이트
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
      }
      
      return { ...state, fileTree: newTree };
    }

    case actionTypes.UPDATE_NODE_CONTENT: {
      const { fileId, newContent } = action.payload;
      const updateNodeInTree = (nodes, id, content) => {
        return nodes.map(node => {
          if (node.id === id) {
            return { ...node, content };
          }
          if (node.children) {
            return { ...node, children: updateNodeInTree(node.children, id, content) };
          }
          return node;
        });
      };
      const newTree = updateNodeInTree(state.fileTree, fileId, newContent);
      const newActiveFile = state.activeFile && state.activeFile.id === fileId 
        ? { ...state.activeFile, content: newContent }
        : state.activeFile;
      return { ...state, fileTree: newTree, activeFile: newActiveFile };
    }

    case actionTypes.RENAME_NODE: {
      const { nodeId, newName } = action.payload;
      const renameNodeInTree = (nodes, id, name) => {
        return nodes.map(node => {
          if (node.id === id) {
            return { ...node, name };
          }
          if (node.children) {
            return { ...node, children: renameNodeInTree(node.children, id, name) };
          }
          return node;
        });
      };
      const newTree = renameNodeInTree(state.fileTree, nodeId, newName);
      const newActiveFile = state.activeFile && state.activeFile.id === nodeId 
        ? { ...state.activeFile, name: newName }
        : state.activeFile;
      return { ...state, fileTree: newTree, activeFile: newActiveFile };
    }

    default:
      return state;
  }
}
