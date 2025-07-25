package first.webide.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "코드 실행 요청 DTO")
public class PistonRequest {

    @Schema(description = "실행할 프로그래밍 언어", example = "java")
    @NotBlank(message = "실행할 언어가 입력되지 않았습니다..")
    private String language;

    @Schema(description = "실행할 파일")
    private List<FileEntry> files;

    @Schema(description = "실행 시 인자를 배열 형태로 전달", example = "[\"input.txt\", \"output.txt\"]")
    private List<String> args;

    @Schema(description = "표준 입력(stdin)으로 전달할 데이터", example = "3\\n5\\n")
    private String stdin;

    @Schema(description = "실행할 언어의 버전", example = "3.8")
    private String version;


    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FileEntry {

        private String name;     // e.g. "main.py"

        @NotBlank(message = "코드가 입력되지 않았습니다.")
        private String content;  // 코드 내용
    }
}

