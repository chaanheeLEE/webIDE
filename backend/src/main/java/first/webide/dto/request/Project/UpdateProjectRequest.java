package first.webide.dto.request.Project;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProjectRequest {
    @NotBlank(message = "프로젝트 이름은 필수입니다.")
    private String name;
    private String description;
}
