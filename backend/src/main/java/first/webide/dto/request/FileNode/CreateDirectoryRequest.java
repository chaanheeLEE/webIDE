package first.webide.dto.request.FileNode;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class CreateDirectoryRequest {

    @NotBlank(message = "이름이 입력되지 않았습니다.")
    private String name;

    @NotBlank(message = "경로가 입력되지 않았습니다.")
    private String parentPath;
}
