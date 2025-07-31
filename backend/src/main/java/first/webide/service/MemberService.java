package first.webide.service;

import first.webide.dto.request.ChangeUsernameRequest;
import first.webide.dto.request.DeleteMemberRequest;
import first.webide.dto.request.LoginRequest;
import first.webide.dto.request.SignUpRequest;
import first.webide.dto.response.LoginResponse;
import first.webide.dto.response.MemberResponse;

public interface MemberService {
    MemberResponse signUp(SignUpRequest request);
    LoginResponse login(LoginRequest request);
    LoginResponse reissueToken(String refreshToken);
    MemberResponse changeUsername(String email, ChangeUsernameRequest request);
    void deleteMember(String email, DeleteMemberRequest request);
}
