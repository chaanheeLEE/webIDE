package first.webide.domain;

import lombok.Getter;


/**
 * FileType type = FileType.FILE;
 * type.getDescription(); // "file"
 */
@Getter
public enum FileType {
    FILE("file"),
    DIRECTORY("directory");

    private final String description;

    FileType(String description) {
        this.description = description;
    }
}

