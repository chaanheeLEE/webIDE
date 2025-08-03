package first.webide.service;

import first.webide.dto.request.Member.*;
import first.webide.dto.response.LoginResponse;
import first.webide.dto.response.MemberResponse;

public interface MemberService {
    MemberResponse signUp(SignUpRequest request);
    LoginResponse login(LoginRequest request);
    void logout(String email);
    LoginResponse reissueToken(String refreshToken);
    MemberResponse getMemberInfo(String email);
    MemberResponse changeUsername(String email, ChangeUsernameRequest request);
    void changePassword(String email, ChangePasswordRequest request);
    void deleteMember(String email, DeleteMemberRequest request);
}
