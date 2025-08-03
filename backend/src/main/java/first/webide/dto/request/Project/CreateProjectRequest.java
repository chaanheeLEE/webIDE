package first.webide.dto.request.Project;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class CreateProjectRequest {
    @NotBlank(message = "프로젝트 이름은 필수입니다.")
    private String projectName;
    private String description;
}
