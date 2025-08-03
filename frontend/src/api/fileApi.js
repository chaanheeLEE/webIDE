import axiosInstance from './axiosInstance';

/**
 * 루트 디렉토리 생성 API
 * @param {Object} data - 루트 디렉토리 생성 데이터
 * @param {string} data.name - 루트 디렉토리 이름
 * @returns {Promise<Object>} 생성된 루트 디렉토리 정보
 */
export const createRootDirectory = async (data) => {
  try {
    const response = await axiosInstance.post('/files/root', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * 하위 디렉토리 생성 API
 * @param {Object} data - 디렉토리 생성 데이터
 * @param {string} data.name - 디렉토리 이름
 * @param {string} data.parentPath - 부모 디렉토리 경로
 * @returns {Promise<Object>} 생성된 디렉토리 정보
 */
export const createDirectory = async (data) => {
  try {
    const response = await axiosInstance.post('/files/directories', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * 파일 생성 API
 * @param {Object} data - 파일 생성 데이터
 * @param {string} data.name - 파일 이름
 * @param {string} data.parentPath - 부모 디렉토리 경로
 * @param {string} data.content - 파일 내용 (기본값: "")
 * @returns {Promise<Object>} 생성된 파일 정보
 */
export const createFile = async (data) => {
  try {
    const response = await axiosInstance.post('/files', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * 루트 디렉토리 조회 API
 * @returns {Promise<Object>} 루트 디렉토리 정보
 */
export const getRootDirectory = async () => {
  try {
    const response = await axiosInstance.get('/files/root');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * 디렉토리의 자식 노드 조회 API
 * @param {string} path - 부모 디렉토리 경로
 * @returns {Promise<Array>} 자식 노드 목록
 */
export const getChildren = async (path) => {
  try {
    const response = await axiosInstance.get('/files/children', {
      params: { path }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * 파일 내용 조회 API
 * @param {string} path - 파일 경로
 * @returns {Promise<Object>} 파일 정보 및 내용
 */
export const getFileContent = async (path) => {
  try {
    const response = await axiosInstance.get('/files/content', {
      params: { path }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * 파일 내용 수정 API
 * @param {Object} data - 파일 수정 데이터
 * @param {string} data.path - 파일 경로
 * @param {string} data.content - 새 파일 내용
 * @returns {Promise<Object>} 수정된 파일 정보
 */
export const updateFileContent = async ({ path, content }) => {
  try {
    const response = await axiosInstance.patch(`/files/content?path=${encodeURIComponent(path)}`, { content });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * 파일 또는 디렉토리 이동 API
 * @param {Object} data - 이동 데이터
 * @param {string} data.sourcePath - 이동할 파일/디렉토리의 현재 경로
 * @param {string} data.destinationPath - 이동될 새로운 부모 디렉토리의 경로
 * @returns {Promise<Object>} 이동된 노드 정보
 */
export const moveNode = async (data) => {
  try {
    const response = await axiosInstance.patch('/files/move', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * 파일 또는 디렉토리 이름 변경 API
 * @param {Object} data - 이름 변경 데이터
 * @param {string} data.path - 현재 파일/디렉토리 경로
 * @param {string} data.newName - 새로운 이름
 * @returns {Promise<Object>} 이름이 변경된 노드 정보
 */
export const renameNode = async (data) => {
  try {
    const response = await axiosInstance.patch('/files/rename', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * 파일 또는 디렉토리 삭제 API
 * @param {string} path - 삭제할 파일/디렉토리 경로
 * @returns {Promise<void>}
 */
export const deleteNode = async (path) => {
  try {
    await axiosInstance.delete('/files', {
      params: { path }
    });
  } catch (error) {
    throw error.response?.data || error;
  }
};
