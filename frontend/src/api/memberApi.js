import axiosInstance from './axiosInstance';

// 사용자 정보 조회
export const getMemberInfo = async () => {
    try {
        const response = await axiosInstance.get('/members/me');
        return response.data;
    } catch (error) {
        console.error('Error fetching member info:', error);
        throw error.response || error;
    }
};

// 사용자 이름 변경
export const updateUsername = async (newUsername) => {
    try {
        const response = await axiosInstance.patch('/members/me/username', { newUsername: newUsername });
        return response.data;
    } catch (error) {
        console.error('Error updating username:', error);
        throw error.response || error;
    }
};

// 비밀번호 변경
export const updatePassword = async (oldPassword, newPassword) => {
    try {
        const response = await axiosInstance.patch('/members/me/password', {
            oldPassword,
            newPassword,
        });
        return response.data;
    } catch (error) {
        console.error('Error updating password:', error);
        throw error.response || error;
    }
};
