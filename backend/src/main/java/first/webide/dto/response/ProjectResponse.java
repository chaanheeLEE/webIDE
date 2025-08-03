package first.webide.dto.response;

import first.webide.domain.Project;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class ProjectResponse {
    private Long id;
    private String name;
    private String description;
    private Boolean isPublic;
    private Long memberId;
    private String memberEmail; // 소유자 이메일 추가
    private Long rootDirId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ProjectResponse from(Project project) {
        return ProjectResponse.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .isPublic(project.isPublic())
                .memberId(project.getMemberId())
                .memberEmail(null) // 기본값, 서비스에서 설정
                .rootDirId(project.getRootDirId())
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .build();
    }

    public static ProjectResponse from(Project project, String memberEmail) {
        return ProjectResponse.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .isPublic(project.isPublic())
                .memberId(project.getMemberId())
                .memberEmail(memberEmail)
                .rootDirId(project.getRootDirId())
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .build();
    }
}
