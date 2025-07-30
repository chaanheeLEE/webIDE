package first.webide.service;

import first.webide.domain.Member;
import first.webide.dto.request.LoginRequest;
import first.webide.dto.request.SignUpRequest;
import first.webide.dto.response.MemberResponse;
import first.webide.exception.BusinessException;
import first.webide.exception.ErrorCode;
import first.webide.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MemberServiceImpl implements MemberService {

    private final MemberRepository memberRepository;

    @Override
    @Transactional
    public MemberResponse signUp(SignUpRequest request) {
        if (memberRepository.existsByLoginId(request.getLoginId())) {
            throw new BusinessException(ErrorCode.LOGIN_ID_DUPLICATED);
        }
        if (memberRepository.existsByUsername(request.getUsername())) {
            throw new BusinessException(ErrorCode.USERNAME_DUPLICATED);
        }

        Member newMember = Member.createNewMember(
                request.getLoginId(),
                request.getPassword(),
                request.getUsername()
        );

        memberRepository.save(newMember);
        return MemberResponse.from(newMember);
    }

    @Override
    public MemberResponse login(LoginRequest request) {
        Member member = memberRepository.findByLoginId(request.getLoginId())
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        if (!member.getPassword().equals(request.getPassword())) {
            throw new BusinessException(ErrorCode.INVALID_PASSWORD);
        }

        return MemberResponse.from(member);
    }
}
