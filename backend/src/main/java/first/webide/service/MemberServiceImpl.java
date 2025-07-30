package first.webide.service;

import first.webide.config.jwt.JwtTokenProvider;
import first.webide.domain.Member;
import first.webide.dto.request.ChangeUsernameRequest;
import first.webide.dto.request.DeleteMemberRequest;
import first.webide.dto.request.LoginRequest;
import first.webide.dto.request.SignUpRequest;
import first.webide.dto.response.LoginResponse;
import first.webide.dto.response.MemberResponse;
import first.webide.exception.BusinessException;
import first.webide.exception.ErrorCode;
import first.webide.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MemberServiceImpl implements MemberService {

    private final MemberRepository memberRepository;
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

            // 3. 인증 정보를 기반으로 JWT 토큰 생성
            String token = jwtTokenProvider.generateToken(authentication);

            return new LoginResponse("Bearer", token);
        } catch (BadCredentialsException e) {
            throw new BusinessException(ErrorCode.LOGIN_FAILED);
        }
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
    public void deleteMember(String email, DeleteMemberRequest request) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        member.withdraw(request.getPassword(), passwordEncoder);

        memberRepository.delete(member);
    }
}
