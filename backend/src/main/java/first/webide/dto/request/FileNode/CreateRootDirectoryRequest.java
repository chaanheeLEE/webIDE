package first.webide.dto.request.FileNode;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class CreateRootDirectoryRequest {

    @NotBlank(message = "이름이 입력되지 않았습니다.")
    private String name;
}
