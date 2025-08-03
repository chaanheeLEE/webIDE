import axiosInstance from './axiosInstance';

/**
 * 회원가입 API
 * @param {Object} signupData - 회원가입 데이터
 * @param {string} signupData.email - 이메일
 * @param {string} signupData.password - 비밀번호
 * @param {string} signupData.username - 사용자 이름
 * @returns {Promise<Object>} 회원가입 응답
 */
export const signUp = async (signupData) => {
  try {
    const response = await axiosInstance.post('/members/signup', signupData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * 로그인 API
 * @param {Object} loginData - 로그인 데이터
 * @param {string} loginData.email - 이메일
 * @param {string} loginData.password - 비밀번호
 * @returns {Promise<Object>} 로그인 응답 (tokenType, accessToken, refreshToken)
 */
export const login = async (loginData) => {
  try {
    const response = await axiosInstance.post('/members/login', loginData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * 토큰 재발급 API
 * @param {string} refreshToken - 리프레시 토큰
 * @returns {Promise<Object>} 새로운 토큰 정보
 */
export const refreshToken = async (refreshToken) => {
  try {
    const response = await axiosInstance.post('/members/refresh', null, {
      headers: {
        'Authorization': `Bearer ${refreshToken}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * 사용자 이름 변경 API
 * @param {Object} data - 변경할 사용자 이름
 * @param {string} data.username - 새 사용자 이름
 * @returns {Promise<Object>} 변경된 사용자 정보
 */
export const changeUsername = async (data) => {
  try {
    const response = await axiosInstance.patch('/members/username', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * 비밀번호 변경 API
 * @param {Object} data - 비밀번호 변경 데이터
 * @param {string} data.currentPassword - 현재 비밀번호
 * @param {string} data.newPassword - 새 비밀번호
 * @returns {Promise<void>}
 */
export const changePassword = async (data) => {
  try {
    const response = await axiosInstance.patch('/members/password', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * 회원 탈퇴 API
 * @param {Object} data - 탈퇴 확인 데이터
 * @param {string} data.password - 비밀번호 확인
 * @returns {Promise<void>}
 */
export const deleteMember = async (data) => {
  try {
    const response = await axiosInstance.delete('/members', { data });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
