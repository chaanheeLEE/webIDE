package first.webide.dto.response;

import first.webide.domain.Member;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class MemberResponse {
    private String loginId;
    private String username;

    public static MemberResponse from(Member member) {
        return MemberResponse.builder()
                .loginId(member.getLoginId())
                .username(member.getUsername())
                .build();
    }
}
