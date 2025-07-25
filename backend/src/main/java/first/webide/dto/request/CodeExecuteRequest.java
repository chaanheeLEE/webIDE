package first.webide.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@Schema(description = "코드 실행 요청 DTO")
public class CodeExecuteRequest {

    @Schema(description = "실행할 코드", example = "System.out.println(\"Hello World\");")
    @NotBlank(message = "코드가 입력되지 않았습니다.")
    private String code;

    @Schema(description = "언어 (예: java, python)", example = "java")
    @NotBlank(message = "실행 가능한 언어가 선택되지 않았습니다.")
    private String language;


    @Schema(description = "파일 이름 (선택)", example = "Main.java", nullable = true)
    private String filename;
}
