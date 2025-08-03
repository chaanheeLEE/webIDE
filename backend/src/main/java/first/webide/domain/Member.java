package first.webide.domain;

import first.webide.exception.BusinessException;
import first.webide.exception.ErrorCode;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Member {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String email;

    @Column(nullable = false, length = 100)
    private String password;

    @Column(nullable = false, unique = true,  length = 15)
    private String username;

    @Enumerated(EnumType.STRING)
    private MemberRole role;

    private LocalDateTime createdDate;

    // 연관관계 매핑
    @OneToMany(mappedBy = "member", cascade = CascadeType.ALL, orphanRemoval = true)
    private final List<Project> projects = new ArrayList<>();

    @OneToOne(mappedBy = "member", cascade = CascadeType.ALL, orphanRemoval = true)
    private RefreshToken refreshToken;

    @Builder
    private Member(String email, String password, String username, MemberRole role) {
        this.email = email;
        this.password = password;
        this.username = username;
        this.role = role;
        this.createdDate = LocalDateTime.now();
    }

    public static Member createNewMember(String email, String rawPassword, String username, PasswordEncoder passwordEncoder) {
        String encodedPassword = passwordEncoder.encode(rawPassword);
        return Member.builder()
                .email(email)
                .password(encodedPassword)
                .username(username)
                .role(MemberRole.USER)
                .build();
    }

    //== Business Logic ==//
    public void changePassword(String oldPassword, String newPassword, PasswordEncoder passwordEncoder) {
        verifyPassword(oldPassword, passwordEncoder);
        this.password = passwordEncoder.encode(newPassword);
    }

    public void verifyPassword(String rawPassword, PasswordEncoder passwordEncoder) {
        if (!passwordEncoder.matches(rawPassword, this.password)) {
            throw new BusinessException(ErrorCode.INVALID_PASSWORD);
        }
    }

    public void changeUsername(String newUsername) {
        this.username = newUsername;
    }

    public void withdraw(String rawPassword, PasswordEncoder passwordEncoder) {
        if (!passwordEncoder.matches(rawPassword, this.password)) {
            throw new BusinessException(ErrorCode.INVALID_PASSWORD);
        }
    }
}
