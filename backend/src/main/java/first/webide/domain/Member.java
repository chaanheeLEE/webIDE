package first.webide.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Member {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true,  length = 15)
    private String loginId;

    @Column(nullable = false, length = 100) // password length increased for hashing
    private String password;

    @Column(nullable = false, unique = true,  length = 15)
    private String username;

    @Enumerated(EnumType.STRING)
    private MemberRole role;

    private LocalDateTime createdDate;

    @Builder
    private Member(String loginId, String password, String username, MemberRole role) {
        this.loginId = loginId;
        this.password = password;
        this.username = username;
        this.role = role;
        this.createdDate = LocalDateTime.now();
    }

    public static Member createNewMember(String loginId, String password, String username) {
        return Member.builder()
                .loginId(loginId)
                .password(password)
                .username(username)
                .role(MemberRole.USER)
                .build();
    }


}
