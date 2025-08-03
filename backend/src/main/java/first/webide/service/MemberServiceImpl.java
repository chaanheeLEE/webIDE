package first.webide.service;

import first.webide.config.auth.UserDetailsImpl;
import first.webide.config.jwt.JwtTokenProvider;
import first.webide.domain.Member;
import first.webide.domain.RefreshToken;
import first.webide.dto.request.Member.*;
import first.webide.dto.response.LoginResponse;
import first.webide.dto.response.MemberResponse;
import first.webide.exception.BusinessException;
import first.webide.exception.ErrorCode;
import first.webide.repository.MemberRepository;
import first.webide.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MemberServiceImpl implements MemberService {

    private final MemberRepository memberRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManagerBuilder authenticationManagerBuilder;
    private final JwtTokenProvider jwtTokenProvider;


    @Override
    @Transactional
    public MemberResponse signUp(SignUpRequest request) {
        if (memberRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }
        if (memberRepository.existsByUsername(request.getUsername())) {
            throw new BusinessException(ErrorCode.USERNAME_ALREADY_EXISTS);
        }

        Member newMember = Member.createNewMember(
                request.getEmail(),
                request.getPassword(),
                request.getUsername(),
                passwordEncoder
        );

        memberRepository.save(newMember);
        return MemberResponse.from(newMember);
    }

    @Override
    @Transactional
    public LoginResponse login(LoginRequest request) {
        try {
            // 1. AuthenticationToken 생성
            UsernamePasswordAuthenticationToken authenticationToken =
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword());

            // 2. 실제 검증 (사용자 비밀번호 체크)
            // loadUserByUsername 메서드가 실행됨
            Authentication authentication = authenticationManagerBuilder.getObject().authenticate(authenticationToken);
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Member member = userDetails.getMember();

            // 3. 인증 정보를 기반으로 JWT 토큰 생성
            String accessToken = jwtTokenProvider.generateToken(authentication);
            String refreshTokenValue = jwtTokenProvider.generateRefreshToken(authentication);

            // 4. 리프레시 토큰 저장 또는 업데이트
            refreshTokenRepository.findByMemberId(member.getId())
                    .ifPresentOrElse(
                            refreshToken -> refreshToken.updateToken(refreshTokenValue),
                            () -> refreshTokenRepository.save(new RefreshToken(member, refreshTokenValue))
                    );

            return new LoginResponse("Bearer", accessToken, refreshTokenValue);
        } catch (BadCredentialsException e) {
            throw new BusinessException(ErrorCode.LOGIN_FAILED);
        }
    }

    @Override
    @Transactional
    public void logout(String email) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));
        refreshTokenRepository.deleteByMember(member);
    }

    @Override
    @Transactional
    public LoginResponse reissueToken(String refreshTokenValue) {
        // 1. 리프레시 토큰 검증
        if (!jwtTokenProvider.validateToken(refreshTokenValue)) {
            throw new BusinessException(ErrorCode.INVALID_REFRESH_TOKEN);
        }

        // 2. 리프레시 토큰으로 인증 정보 조회
        Authentication authentication = jwtTokenProvider.getAuthentication(refreshTokenValue);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Member member = userDetails.getMember();

        // 3. DB의 리프레시 토큰과 일치하는지 확인
        RefreshToken refreshToken = refreshTokenRepository.findByMemberId(member.getId())
                .orElseThrow(() -> new BusinessException(ErrorCode.REFRESH_TOKEN_NOT_FOUND));

        if (!refreshToken.getToken().equals(refreshTokenValue)) {
            throw new BusinessException(ErrorCode.INVALID_REFRESH_TOKEN);
        }

        // 4. 새로운 액세스 토큰 생성
        String newAccessToken = jwtTokenProvider.generateToken(authentication);

        return new LoginResponse("Bearer", newAccessToken, refreshTokenValue);
    }

    @Override
    public MemberResponse getMemberInfo(String email) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));
        return MemberResponse.from(member);
    }

    @Override
    @Transactional
    public MemberResponse changeUsername(String email, ChangeUsernameRequest request) {
        if (request.getNewUsername() == null || request.getNewUsername().isBlank()) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE);
        }
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        if (memberRepository.existsByUsername(request.getNewUsername())) {
            throw new BusinessException(ErrorCode.USERNAME_ALREADY_EXISTS);
        }

        member.changeUsername(request.getNewUsername());
        return MemberResponse.from(member);
    }

    @Override
    @Transactional
    public void changePassword(String email, ChangePasswordRequest request){
        if (request.getNewPassword() == null || request.getNewPassword().isBlank()) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE);
        }
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new  BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        member.changePassword(request.getOldPassword(), request.getNewPassword(), passwordEncoder);
    }

    @Override
    @Transactional
    public void deleteMember(String email, DeleteMemberRequest request) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        member.withdraw(request.getPassword(), passwordEncoder);

        memberRepository.delete(member);
    }
}
