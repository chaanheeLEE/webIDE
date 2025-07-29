package first.webide.service;

import first.webide.domain.FileNode;
import first.webide.domain.FileType;
import first.webide.exception.BusinessException;
import first.webide.exception.ErrorCode;
import first.webide.repository.FileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class FileService {

    private final FileRepository  fileRepository;

    private FileNode getFileByPath(String path) {
        return fileRepository.findByPath(path)
                .orElseThrow(() -> new BusinessException(ErrorCode.FILE_NOT_FOUND));
    }

    private FileNode isDirectory(FileNode fileNode) {
        if (!fileNode.isDirectory()) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE);
        }
        return fileNode;
    }
    private FileNode isFile(FileNode fileNode) {
        if (!fileNode.isFile()) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE);
        }
        return fileNode;
    }


    /**
     * Create
     */
    // 루트 디렉토리 생성
    @Transactional
    public FileNode createRootDirectory(String name) {
        String rootPath = "/" + name;

        if (fileRepository.findByPath(rootPath).isPresent()) {
            throw new BusinessException(ErrorCode.FILE_ALREADY_EXISTS);
        }

        FileNode root = FileNode.createRootDirectory(name);
        return fileRepository.save(root);
    }

    // 하위 디렉토리 생성
    @Transactional
    public FileNode createDirectory(String parentPath, String name) {
        FileNode parent = isDirectory(getFileByPath(parentPath));

        if (fileRepository.existsByParentAndName(parent, name)) {
            throw new BusinessException(ErrorCode.FILE_ALREADY_EXISTS);
        }

        FileNode dir = FileNode.create(parent, name, FileType.DIRECTORY, null);
        return fileRepository.save(dir);
    }

    // 하위 파일 생성
    @Transactional
    public FileNode createFile(String parentPath, String name, String content) {
        FileNode parent = isDirectory(getFileByPath(parentPath));

        if (fileRepository.existsByParentAndName(parent, name)) {
            throw new BusinessException(ErrorCode.FILE_ALREADY_EXISTS);
        }

        FileNode file = FileNode.create(parent, name, FileType.FILE, content);
        return fileRepository.save(file);
    }


    /**
     *  Read
     */
    // 루트 디렉터리 조회
    public FileNode getRootDirectory() {
        return fileRepository.findByParentIsNull()
                .orElseThrow(()-> new BusinessException(ErrorCode.FILE_NOT_FOUND));
    }

    // 디렉토리 자식 조회
    public List<FileNode> getChildren(String parentPath) {
        FileNode parent = isDirectory(getFileByPath(parentPath));
        return fileRepository.findByParentOrderByTypeAscNameAsc(parent);
    }

    // 파일 내용 조회
    public String getContent(String path) {
        FileNode file = isFile(getFileByPath(path));
        return file.getContent();
    }


    /**
     *  Update
     */
    // 파일 내용 업데이트
    @Transactional
    public FileNode updateContent(String path, String content) {
        FileNode file = isFile(getFileByPath(path));
        file.updateContent(content);
        return fileRepository.save(file);
    }

    // 파일노드 이름 변경
    @Transactional
    public FileNode rename(String path, String name) {
        FileNode node = getFileByPath(path);
        FileNode parent = node.getParent();

        if (parent != null && fileRepository.existsByParentAndName(parent, name)) {
            throw new BusinessException(ErrorCode.FILE_ALREADY_EXISTS);
        }

        node.rename(name);
        return fileRepository.save(node);
    }


    /**
     * Delete
     */
    // 파일노드 삭제
    @Transactional
    public void delete(String path) {
        FileNode node = getFileByPath(path);

        // 부모 노드가 있다면, 부모의 자식 리스트에서 자신을 제거하여 관계를 명확히 끊음
        if (node.getParent() != null) {
            node.getParent().getChildren().remove(node);
        }

        fileRepository.delete(node);
    }
}
