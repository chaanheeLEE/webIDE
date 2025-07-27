package first.webide.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class FileNode {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(nullable = false, unique = true,  length = 50)
    private String path;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FileType type;

    @Lob
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private FileNode parent;

    @OneToMany(mappedBy = "parent",cascade = CascadeType.ALL, orphanRemoval = true)
    private final List<FileNode> children =  new ArrayList<>();


    // 생성자
    private FileNode(String name, String path, FileType type, String content) {
        validateName(name);
        this.name = name;
        this.path = path;
        this.type = type;
        if (type == FileType.FILE) {
            this.content = content;
        }
    }

    private void validateName(String name) {
        if (name == null) {
            throw new IllegalArgumentException("name cannot be null");
        }
        if (name.isBlank()) {
            throw new IllegalArgumentException("name cannot be blank");
        }
        if (name.contains("/") || name.contains("\\")) {
            throw new IllegalArgumentException("name cannot contain '/' or '\\'");
        }
    }

    // -- 생성 메서드 --

    // 루트 디렉토리를 생성
    public static FileNode createRootDirectory(String name) {
        String path = "/" + name;
        return  new FileNode(name, path, FileType.DIRECTORY, null);
    }

    // 하위 파일 또는 디렉터리 생성
    public static FileNode create(FileNode parent, String name, FileType type, String content) {
        if (parent == null || !parent.isDirectory()) {
            throw new IllegalArgumentException("parent is null");
        }
        String path = buildPath(parent.getPath(), name);
        FileNode fileNode = new FileNode(name, path, type, content);
        fileNode.parent = parent;
        parent.children.add(fileNode);
        return fileNode;
    }


    // -- 업데이트 메서드 --

    //
    public void updateContent(String content) {
        if (!isFile()) {
            throw new IllegalArgumentException("content of directory can't update");
        }
        this.content = content;
    }

    // 파일 이름 수정
    public void rename(String newName) {
        validateName(newName);
        String oldPath = this.path;
        this.name = newName;

        String newPath = this.parent != null ? buildPath(this.parent.path, newName) : "/" + newName;
        this.path = newPath;

        if (isDirectory()){
            updateChildrenPath(oldPath, newPath);
        }
    }

    // 자식들 경로 업데이트
    private void updateChildrenPath(String oldPath, String newPath) {
        for (FileNode child : this.children) {
            String oldChildPath = child.getPath();
            String newChildPath = oldChildPath.replaceFirst(oldPath, newPath);
            child.path = newChildPath;

            if (child.isDirectory()) { //  재귀적 업데이트
                child.updateChildrenPath(oldChildPath, newChildPath);
            }
        }
    }

    // 경로 설정
    private static String buildPath(String parentPath, String fileName) {
        if (parentPath.equals("/")){
            return "/" + fileName;
        }
        return  parentPath + "/" + fileName;
    }


    public boolean isDirectory() {
        return type == FileType.DIRECTORY;
    }
    public boolean isFile() {
        return type == FileType.FILE;
    }


}
