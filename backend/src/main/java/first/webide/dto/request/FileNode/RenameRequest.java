package first.webide.dto.request.FileNode;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@Schema(description = "이름 변경 요청 정보")
public class RenameRequest {

    @Schema(
            description = "새로운 이름",
            example = "newFile.java",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    @NotBlank(message = "이름이 입력되지 않았습니다.")
    private String newName;
}
