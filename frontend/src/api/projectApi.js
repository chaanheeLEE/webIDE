import axiosInstance from './axiosInstance';

/**
 * 프로젝트 생성 API
 * @param {Object} projectData - 프로젝트 생성 데이터
 * @param {string} projectData.projectName - 프로젝트 이름
 * @param {string} projectData.description - 프로젝트 설명
 * @returns {Promise<Object>} 생성된 프로젝트 정보
 */
export const createProject = async (projectData) => {
  try {
    console.log('프로젝트 생성 요청 데이터:', projectData);
    console.log('현재 토큰:', localStorage.getItem('accessToken'));
    
    const response = await axiosInstance.post('/projects', projectData);
    console.log('프로젝트 생성 성공:', response.data);
    return response.data;
  } catch (error) {
    console.error('프로젝트 생성 에러 (전체):', error);
    console.error('에러 응답:', error.response);
    console.error('에러 요청:', error.request);
    console.error('에러 메시지:', error.message);
    console.error('에러 코드:', error.code);
    
    if (error.response) {
      // 서버에서 응답을 받았지만 에러 상태코드
      console.log('서버 응답 상태:', error.response.status);
      console.log('서버 응답 데이터:', error.response.data);
      throw {
        status: error.response.status,
        message: error.response.data?.message || `서버 에러: ${error.response.status}`,
        data: error.response.data,
        originalError: error
      };
    } else if (error.request) {
      // 요청은 보냈지만 응답을 받지 못함
      console.log('네트워크 에러 - 응답 없음');
      throw {
        status: 0,
        message: '서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.',
        data: null,
        originalError: error
      };
    } else {
      // 요청 설정 중 에러 발생
      console.log('요청 설정 에러');
      throw {
        status: -1,
        message: error.message || '요청 처리 중 오류가 발생했습니다.',
        data: null,
        originalError: error
      };
    }
  }
};

/**
 * 내 프로젝트 목록 조회 API (인증 필요)
 * @returns {Promise<Array>} 내 프로젝트 목록
 */
export const getMyProjects = async () => {
  try {
    const response = await axiosInstance.get('/projects/my');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * 공개 프로젝트 목록 조회 API (페이징)
 * @param {Object} params - 페이징 파라미터
 * @param {number} params.page - 페이지 번호 (0부터 시작)
 * @param {number} params.size - 페이지 크기
 * @param {string} params.sort - 정렬 기준
 * @returns {Promise<Object>} 페이징된 공개 프로젝트 목록
 */
export const getPublicProjects = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/projects/public', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * 프로젝트 정보 수정 API
 * @param {number} projectId - 프로젝트 ID
 * @param {Object} updateData - 수정할 데이터
 * @param {string} updateData.projectName - 새 프로젝트 이름
 * @param {string} updateData.description - 새 프로젝트 설명
 * @returns {Promise<Object>} 수정된 프로젝트 정보
 */
export const updateProject = async (projectId, updateData) => {
  try {
    const response = await axiosInstance.patch(`/projects/${projectId}`, updateData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * 프로젝트 공개/비공개 상태 변경 API
 * @param {number} projectId - 프로젝트 ID
 * @param {Object} publishData - 공개 상태 데이터
 * @param {boolean} publishData.isPublished - 공개 여부
 * @returns {Promise<Object>} 변경된 프로젝트 정보
 */
export const updateProjectPublishStatus = async (projectId, publishData) => {
  try {
    // publishData should be an object like { isPublished: true }
    const response = await axiosInstance.patch(`/projects/${projectId}/publish`, publishData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * 프로젝트 상세 정보 조회 API
 * @param {number} projectId - 프로젝트 ID
 * @returns {Promise<Object>} 프로젝트 상세 정보
 */
export const getProjectDetails = async (projectId) => {
  try {
    const response = await axiosInstance.get(`/projects/${projectId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * 프로젝트 삭제 API
 * @param {number} projectId - 삭제할 프로젝트 ID
 * @returns {Promise<void>}
 */
export const deleteProject = async (projectId) => {
  try {
    const response = await axiosInstance.delete(`/projects/${projectId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
