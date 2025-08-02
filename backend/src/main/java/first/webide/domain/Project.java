package first.webide.domain;

import first.webide.exception.BusinessException;
import first.webide.exception.ErrorCode;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(nullable = false)
    private Long memberId; // Member  ID만 참조

    @Column(nullable = true) // 프로젝트 생성 후 루트 디렉토리가 설정되므로 nullable
    private Long rootDirId; // FileNode  ID만 참조

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @Column(nullable = false)
    private boolean isPublic = false; // 기본값은 false (비공개)


    @Builder
    public Project(String name, String description, Long memberId, boolean isPublic) {
        this.name = name;
        this.description = description;
        this.memberId = memberId;
        this.isPublic = isPublic;
    }

    public static Project createProject(String name, String description, Long memberId) {
        return Project.builder()
                .name(name)
                .description(description)
                .memberId(memberId)
                .isPublic(false)  // 명시적으로 비공개로 시작
                .build();
    }

    //==연관관계 편의 메서드==//
    public void linkRootDirectory(Long rootDirId) {
        if (this.rootDirId != null) {
            throw new BusinessException(ErrorCode.PROJECT_ROOT_ALREADY_SET);
        }
        this.rootDirId = rootDirId;
    }

    //==비즈니스 로직==//
    public void rename(String name) {
        if (name == null || name.isBlank()) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE);
        }
        this.name = name;
    }

    public void updateDescription(String description) {
        this.description = description;
    }

    /**
     * 프로젝트를 허브에 공개합니다.
     */
    public void publish() {
        this.isPublic = true;
    }

    /**
     * 프로젝트를 비공개로 전환합니다.
     */
    public void unpublish() {
        this.isPublic = false;
    }

}
