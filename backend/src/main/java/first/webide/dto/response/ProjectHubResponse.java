package first.webide.dto.response;

import first.webide.domain.Member;
import first.webide.domain.Project;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class ProjectHubResponse {
    private final Long id;
    private final String name;
    private final String description;
    private final String ownerUsername;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    public ProjectHubResponse(Project project, Member owner) {
        this.id = project.getId();
        this.name = project.getName();
        this.description = project.getDescription();
        this.ownerUsername = owner.getUsername();
        this.createdAt = project.getCreatedAt();
        this.updatedAt = project.getUpdatedAt();
    }
}
