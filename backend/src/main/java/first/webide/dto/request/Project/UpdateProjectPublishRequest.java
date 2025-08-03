package first.webide.dto.request.Project;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProjectPublishRequest {
    @NotNull(message = "공개 여부는 필수입니다.")
    private Boolean isPublic;
}
