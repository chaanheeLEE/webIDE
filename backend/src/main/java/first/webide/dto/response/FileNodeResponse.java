package first.webide.dto.response;

import first.webide.domain.FileNode;
import first.webide.domain.FileType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.Optional;

@Getter
@Builder
@Schema(description = "파일 노드 응답 정보")
public class FileNodeResponse {

    private Long id;
    private String name;
    private String path;

    @Schema(description = "파일 타입",
            allowableValues = {"FILE", "DIRECTORY"},
            example = "FILE")
    private FileType type;

    @Schema(description = "파일 내용 (파일인 경우에만 포함)",
            example = "public class Main { }",
            nullable = true)
    private String content;

    @Schema(description = "하위 파일/디렉토리 목록 (디렉토리인 경우에만 포함)",
            nullable = true)
    private List<FileNodeResponse> children;

    public static FileNodeResponse from(FileNode fileNode) {
        return FileNodeResponse.builder()
                .id(fileNode.getId())
                .name(fileNode.getName())
                .path(fileNode.getPath())
                .type(fileNode.getType())
                .content(fileNode.getContent())
                .children(
                        Optional.ofNullable(fileNode.getChildren())
                                .orElse(List.of())
                                .stream()
                                .map(FileNodeResponse::from)
                                .toList()
                )
                .build();
    }


}
