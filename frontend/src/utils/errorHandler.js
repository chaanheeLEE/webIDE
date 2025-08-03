// 에러 핸들링 유틸리티

/**
 * API 에러를 사용자 친화적인 메시지로 변환합니다.
 * @param {Object} error - API 에러 객체
 * @returns {string} 사용자에게 표시할 에러 메시지
 */
export const getErrorMessage = (error) => {
    // 토큰 만료 관련 에러 처리
    if (error.status === 401) {
        if (error.response?.data?.message?.includes('토큰') || 
            error.response?.data?.message?.includes('token') ||
            error.response?.data?.message?.includes('expired')) {
            return '로그인 세션이 만료되었습니다. 다시 로그인해주세요.';
        }
        return '로그인이 필요합니다. 다시 로그인해주세요.';
    }
    
    if (error.status === 403) {
        return '접근 권한이 없습니다. 다시 로그인해주세요.';
    }
    
    if (error.status === 500) {
        return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
    }
    
    if (error.status === 0) {
        return '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.';
    }
    
    // 기본 에러 메시지
    return error.response?.data?.message || error.message || '알 수 없는 오류가 발생했습니다.';
};

/**
 * 토큰 만료 시 로그아웃 처리를 수행합니다.
 * @param {Function} logout - AuthContext의 logout 함수
 * @param {Function} navigate - React Router의 navigate 함수
 * @param {string} message - 표시할 메시지 (선택사항)
 */
export const handleTokenExpiration = (logout, navigate, message = '로그인 세션이 만료되었습니다. 다시 로그인해주세요.') => {
    alert(message);
    logout();
    navigate('/login');
};

/**
 * API 에러를 처리하고 필요시 로그아웃을 수행합니다.
 * @param {Object} error - API 에러 객체
 * @param {Function} logout - AuthContext의 logout 함수 (선택사항)
 * @param {Function} navigate - React Router의 navigate 함수 (선택사항)
 * @returns {string} 사용자에게 표시할 에러 메시지
 */
export const handleApiError = (error, logout = null, navigate = null) => {
    const errorMessage = getErrorMessage(error);
    
    // 토큰 만료 에러이고 logout, navigate 함수가 제공된 경우 자동 로그아웃 처리
    if ((error.status === 401 || error.status === 403) && logout && navigate) {
        handleTokenExpiration(logout, navigate, errorMessage);
        return errorMessage;
    }
    
    return errorMessage;
};
