import axiosInstance from './axiosInstance';

/**
 * 코드 실행 API
 * @param {Object} data - 코드 실행 데이터
 * @param {string} data.language - 실행할 언어 (예: "java", "python", "javascript")
 * @param {string} data.code - 실행할 코드
 * @param {string} data.filename - 파일 이름 (선택사항)
 * @param {string} data.version - 언어 버전 (선택사항)
 * @param {Array<string>} data.args - 실행 인자 (선택사항)
 * @param {string} data.input - 입력 데이터 (선택사항)
 * @returns {Promise<Object>} 코드 실행 결과
 */
export const executeCode = async (data) => {
  try {
    const response = await axiosInstance.post('/execute', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * 지원하는 언어 목록 조회 (이는 프론트엔드에서 관리하거나 별도 API가 필요할 수 있음)
 * @returns {Array} 지원하는 언어 목록
 */
export const getSupportedLanguages = () => {
  return [
    { id: 'java', name: 'Java', extension: '.java' },
    { id: 'python', name: 'Python', extension: '.py' },
    { id: 'javascript', name: 'JavaScript', extension: '.js' },
    { id: 'cpp', name: 'C++', extension: '.cpp' },
    { id: 'c', name: 'C', extension: '.c' },
    { id: 'go', name: 'Go', extension: '.go' },
    { id: 'rust', name: 'Rust', extension: '.rs' },
    // 백엔드에서 지원하는 언어에 따라 추가/수정
  ];
};
