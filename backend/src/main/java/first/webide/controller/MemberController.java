package first.webide.controller;

import first.webide.config.auth.UserDetailsImpl;
import first.webide.dto.request.Member.*;
import first.webide.dto.response.LoginResponse;
import first.webide.dto.response.MemberResponse;
import first.webide.service.MemberService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;

@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
@Tag(name = "Member API", description = "사용자 회원가입 및 로그인 관리 API")
public class MemberController {

    private final MemberService memberService;

    @Operation(summary = "회원가입")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "회원가입 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
            @ApiResponse(responseCode = "409", description = "이메일 또는 사용자 이름 중복")
    })
    @PostMapping("/signup")
    public ResponseEntity<MemberResponse> signUp(@Valid @RequestBody SignUpRequest request) {
        MemberResponse response = memberService.signUp(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "로그인", description = "로그인 성공 시 JWT 토큰을 반환합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "로그인 성공"),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "404", description = "사용자를 찾을 수 없음")
    })
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request) {
        LoginResponse loginResponse = memberService.login(request);
        String refreshToken = loginResponse.getRefreshToken();

        ResponseCookie refreshTokenCookie =
                ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)             // 자바스크립트 접근 제한 (XSS 방지)
                .secure(true)               // HTTPS 환경에서만 전송 보장
                .path("/")                 // 쿠키 적용 경로
                .maxAge(Duration.ofDays(7)) // 쿠키 만료 기간 7일 설정
                .sameSite("None")           // CORS 상황에 따라 None, Lax, Strict 선택 가능
                .build();

        // Set-Cookie 헤더에 쿠키 추가
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString())
                .body(loginResponse);
    }

    @Operation(summary = "토큰 재발급", description = "리프레시 토큰을 사용하여 새로운 액세스 토큰을 발급합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "토큰 재발급 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 리프레시 토큰")
    })
    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refreshToken(@RequestHeader("Authorization") String refreshToken) {
        if (refreshToken != null && refreshToken.startsWith("Bearer ")) {
            refreshToken = refreshToken.substring(7);
        }
        LoginResponse response = memberService.reissueToken(refreshToken);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "사용자 이름 변경", description = "인증된 사용자의 이름을 변경합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "이름 변경 성공"),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "404", description = "사용자를 찾을 수 없음"),
            @ApiResponse(responseCode = "409", description = "이미 사용중인 이름")
    })
    @PatchMapping("/username")
    public ResponseEntity<MemberResponse> changeUsername(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody ChangeUsernameRequest request) {
        MemberResponse response = memberService.changeUsername(userDetails.getUsername(), request);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "사용자 비밀번호 변경", description = "인증된 사용자의 비밀번호를 변경합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "비밀번호 변경 성공"),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "404", description = "사용자를 찾을 수 없음"),
            @ApiResponse(responseCode = "409", description = "이미 사용중인 비밀번호")
    })
    @PatchMapping("/password")
    public ResponseEntity<Void> changePassword(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody ChangePasswordRequest request) {
        memberService.changePassword(userDetails.getUsername(), request);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "회원 탈퇴", description = "인증된 사용자가 자신의 계정을 삭제합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "회원 탈퇴 성공"),
            @ApiResponse(responseCode = "401", description = "인증 실패 또는 비밀번호 불일치"),
            @ApiResponse(responseCode = "404", description = "사용자를 찾을 수 없음")
    })
    @DeleteMapping
    public ResponseEntity<Void> deleteMember(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody DeleteMemberRequest request) {
        memberService.deleteMember(userDetails.getUsername(), request);
        return ResponseEntity.noContent().build();
    }
}
