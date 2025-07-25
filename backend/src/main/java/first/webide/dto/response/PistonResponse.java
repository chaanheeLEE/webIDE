package first.webide.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Piston 코드 실행 응답 DTO")
public class PistonResponse {

    @Schema(description = "실행된 언어", example = "python")
    private String language;

    @Schema(description = "언어 버전", example = "3.10.0")
    private String version;

    @Schema(description = "코드 실행 결과")
    private RunResult run;

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "실행 결과 상세(run 오브젝트)")
    public static class RunResult {
        @Schema(description = "표준 출력", example = "Hello, World!\n")
        private String stdout;

        @Schema(description = "표준 에러", example = "")
        private String stderr;

        @Schema(description = "프로세스 종료 코드", example = "0")
        private int code;

        @Schema(description = "종료 신호 (있을 때)", example = "null")
        private String signal;

        @Schema(description = "전체 출력", example = "Hello, World!\n")
        private String output;
    }
}

