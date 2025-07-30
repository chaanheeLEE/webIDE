package first.webide.service;

import first.webide.dto.request.LoginRequest;
import first.webide.dto.request.SignUpRequest;
import first.webide.dto.response.MemberResponse;

public interface MemberService {
    MemberResponse signUp(SignUpRequest request);
    MemberResponse login(LoginRequest request);
}
