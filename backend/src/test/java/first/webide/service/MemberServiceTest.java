package first.webide.service;

import first.webide.domain.Member;
import first.webide.domain.RefreshToken;
import first.webide.dto.request.Member.*;
import first.webide.dto.response.LoginResponse;
import first.webide.exception.BusinessException;
import first.webide.repository.MemberRepository;
import first.webide.repository.RefreshTokenRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
class MemberServiceTest {

    @Autowired
    private MemberService memberService;

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @AfterEach
    void tearDown() {
        refreshTokenRepository.deleteAllInBatch();
        memberRepository.deleteAllInBatch();
    }

    @DisplayName("회원가입에 성공한다.")
    @Test
    void signUp() {
        // given
        SignUpRequest request = new SignUpRequest("test@test.com", "password1234", "tester");

        // when
        memberService.signUp(request);

        // then
        Member foundMember = memberRepository.findByEmail("test@test.com").get();
        assertThat(foundMember.getEmail()).isEqualTo(request.getEmail());
        assertThat(foundMember.getUsername()).isEqualTo(request.getUsername());
    }

    @DisplayName("중복된 이메일로 회원가입 시 예외가 발생한다.")
    @Test
    void signUpWithDuplicateEmail() {
        // given
        SignUpRequest request1 = new SignUpRequest("test@test.com", "password1234", "tester1");
        memberService.signUp(request1);

        SignUpRequest request2 = new SignUpRequest("test@test.com", "password5678", "tester2");

        // when & then
        assertThatThrownBy(() -> memberService.signUp(request2))
                .isInstanceOf(BusinessException.class);
    }

    @DisplayName("중복된 이름으로 회원가입 시 예외가 발생한다.")
    @Test
    void signUpWithDuplicateUsername() {
        // given
        SignUpRequest request1 = new SignUpRequest("test1@test.com", "password1234", "tester");
        memberService.signUp(request1);

        SignUpRequest request2 = new SignUpRequest("test2@test.com", "password5678", "tester");

        // when & then
        assertThatThrownBy(() -> memberService.signUp(request2))
                .isInstanceOf(BusinessException.class);
    }

    @DisplayName("로그인에 성공하고 리프레시 토큰을 저장한다.")
    @Test
    void login() {
        // given
        SignUpRequest signUpRequest = new SignUpRequest("test@test.com", "password1234", "tester");
        memberService.signUp(signUpRequest);

        LoginRequest request = new LoginRequest("test@test.com", "password1234");

        // when
        LoginResponse token = memberService.login(request);

        // then
        assertThat(token).isNotNull();
        assertThat(token.getAccessToken()).isNotBlank();
        assertThat(token.getRefreshToken()).isNotBlank();

        Member member = memberRepository.findByEmail("test@test.com").get();
        RefreshToken refreshToken = refreshTokenRepository.findByMemberId(member.getId()).get();
        assertThat(refreshToken.getToken()).isEqualTo(token.getRefreshToken());
    }

    @DisplayName("잘못된 비밀번호로 로그인 시 예외가 발생한다.")
    @Test
    void loginWithWrongPassword() {
        // given
        SignUpRequest signUpRequest = new SignUpRequest("test@test.com", "password1234", "tester");
        memberService.signUp(signUpRequest);

        LoginRequest loginRequest = new LoginRequest("test@test.com", "wrongpassword");

        // when & then
        assertThatThrownBy(() -> memberService.login(loginRequest))
                .isInstanceOf(BusinessException.class);
    }

    @DisplayName("유효한 리프레시 토큰으로 새로운 액세스 토큰을 재발급 받는다.")
    @Test
    void reissueToken() {
        // given
        SignUpRequest signUpRequest = new SignUpRequest("test@test.com", "password1234", "tester");
        memberService.signUp(signUpRequest);
        LoginRequest loginRequest = new LoginRequest("test@test.com", "password1234");
        LoginResponse loginResponse = memberService.login(loginRequest);
        String originalRefreshToken = loginResponse.getRefreshToken();

        // when
        LoginResponse reissueResponse = memberService.reissueToken(originalRefreshToken);

        // then
        assertThat(reissueResponse).isNotNull();
        assertThat(reissueResponse.getAccessToken()).isNotBlank();
        assertThat(reissueResponse.getAccessToken()).isNotEqualTo(loginResponse.getAccessToken());
        assertThat(reissueResponse.getRefreshToken()).isEqualTo(originalRefreshToken);
    }

    @DisplayName("유효하지 않은 리프레시 토큰으로 재발급 요청 시 예외가 발생한다.")
    @Test
    void reissueTokenWithInvalidToken() {
        // given
        String invalidRefreshToken = "invalid-token";

        // when & then
        assertThatThrownBy(() -> memberService.reissueToken(invalidRefreshToken))
                .isInstanceOf(BusinessException.class);
    }


    @DisplayName("사용자 이름 변경에 성공한다.")
    @Test
    void changeUsername() {
        // given
        SignUpRequest signUpRequest = new SignUpRequest("test@test.com", "password1234", "tester");
        memberService.signUp(signUpRequest);
        String newUsername = "newTester";
        ChangeUsernameRequest request = new ChangeUsernameRequest(newUsername);

        // when
        memberService.changeUsername("test@test.com", request);

        // then
        Member member = memberRepository.findByEmail("test@test.com").get();
        assertThat(member.getUsername()).isEqualTo(newUsername);
    }

    @DisplayName("사용자 비밀번호 변경에 성공한다.")
    @Test
    void changePassword() {
        // given
        SignUpRequest signUpRequest = new SignUpRequest(
                "test@test.com", "password1234", "tester");
        memberService.signUp(signUpRequest);

        ChangePasswordRequest request = new ChangePasswordRequest(
                signUpRequest.getPassword(), "newPassword123");

        // when
        memberService.changePassword("test@test.com", request);

        // then
        Member member = memberRepository.findByEmail("test@test.com").get();
        boolean matches = passwordEncoder.matches("newPassword123", member.getPassword());
        assertThat(matches).isTrue();
    }

    @DisplayName("이미 존재하는 이름으로 변경 시 예외가 발생한다.")
    @Test
    void changeUsernameWithDuplicateUsername() {
        // given
        SignUpRequest signUpRequest1 = new SignUpRequest("test1@test.com", "password1234", "tester1");
        memberService.signUp(signUpRequest1);

        SignUpRequest signUpRequest2 = new SignUpRequest("test2@test.com", "password1234", "tester2");
        memberService.signUp(signUpRequest2);

        ChangeUsernameRequest request = new ChangeUsernameRequest("tester2");

        // when & then
        assertThatThrownBy(() -> memberService.changeUsername("test1@test.com", request))
                .isInstanceOf(BusinessException.class);
    }

    @DisplayName("회원 탈퇴에 성공한다.")
    @Test
    void deleteMember() {
        // given
        SignUpRequest signUpRequest = new SignUpRequest("test@test.com", "password1234", "tester");
        memberService.signUp(signUpRequest);
        DeleteMemberRequest request = new DeleteMemberRequest("password1234");

        // when
        memberService.deleteMember("test@test.com", request);

        // then
        assertThat(memberRepository.findByEmail("test@test.com")).isEmpty();
    }

    @DisplayName("잘못된 비밀번호로 회원 탈퇴 시 예외가 발생한다.")
    @Test
    void deleteMemberWithWrongPassword() {
        // given
        SignUpRequest signUpRequest = new SignUpRequest("test@test.com", "password1234", "tester");
        memberService.signUp(signUpRequest);
        DeleteMemberRequest request = new DeleteMemberRequest("wrongpassword");

        // when & then
        assertThatThrownBy(() -> memberService.deleteMember("test@test.com", request))
                .isInstanceOf(BusinessException.class);
    }
}
