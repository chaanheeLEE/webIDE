package first.webide.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@Schema(description = "코드 실행 응답 DTO")
public class CodeExecuteResponse {

    @Schema(description = "실행 성공 여부", example = "true")
    private boolean success;

    @Schema(description = "코드 실행 결과 (표준 출력)", example = "Hello, World!")
    private String output;

    @Schema(description = "에러 메시지 (실패 시)", example = "SyntaxError: invalid syntax", nullable = true)
    private String error;

    @Schema(description = "실행 소요 시간 (밀리초)", example = "123")
    private long executionTime;

    public static CodeExecuteResponse success(String output, long executionTime) {
        return CodeExecuteResponse.builder()
                .success(true)
                .output(output)
                .executionTime(executionTime)
                .build();
    }

    public static CodeExecuteResponse failure(String error, long executionTime) {
        return CodeExecuteResponse.builder()
                .success(false)
                .error(error)
                .executionTime(executionTime)
                .build();
    }
}
