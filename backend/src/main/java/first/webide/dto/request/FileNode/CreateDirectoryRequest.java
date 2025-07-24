package first.webide.dto.request.FileNode;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@Schema(description = "디렉토리 생성 요청 정보")
public class CreateDirectoryRequest {

    @Schema(
            description = "생성할 디렉토리 이름",
            example = "components",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    @NotBlank(message = "이름이 입력되지 않았습니다.")
    private String name;

    @Schema(
            description = "부모 디렉토리의 경로",
            example = "/project/src",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    @NotBlank(message = "경로가 입력되지 않았습니다.")
    private String parentPath;
}
