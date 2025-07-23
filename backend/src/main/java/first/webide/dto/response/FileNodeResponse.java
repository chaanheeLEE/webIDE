package first.webide.dto.response;

import first.webide.domain.FileNode;
import first.webide.domain.FileType;
import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.Optional;

@Getter
@Builder
public class FileNodeResponse {
    private Long id;
    private String name;
    private String path;
    private FileType type;
    private String content;
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
