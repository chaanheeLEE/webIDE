package first.webide.service;

import first.webide.domain.FileNode;
import first.webide.domain.FileType;
import first.webide.exception.BusinessException;
import first.webide.exception.ErrorCode;
import first.webide.repository.FileRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
@Transactional
class FileServiceTest {

    @Autowired
    private EntityManager em;

    @Autowired
    private FileService fileService;

    @Autowired
    private FileRepository fileRepository;

    private FileNode rootDir;

    @BeforeEach
    void setUp() {
        // 모든 테스트 전에 루트 디렉토리 생성
        rootDir = fileService.createRootDirectory("testRoot");
    }

    @Test
    @DisplayName("루트 디렉토리 생성 성공")
    void createRootDirectory_Success() {
        // Given & When in setUp()

        // Then
        FileNode foundRoot = fileRepository.findByPath("/testRoot").orElse(null);
        assertThat(foundRoot).isNotNull();
        assertThat(foundRoot.getName()).isEqualTo("testRoot");
        assertThat(foundRoot.getType()).isEqualTo(FileType.DIRECTORY);
        assertThat(foundRoot.getParent()).isNull();
    }

    @Test
    @DisplayName("이미 존재하는 루트 디렉토리 생성 시 예외 발생")
    void createRootDirectory_Fail_AlreadyExists() {
        // Given in setUp()

        // When & Then
        BusinessException exception = assertThrows(BusinessException.class, () -> {
            fileService.createRootDirectory("testRoot");
        });
        assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.FILE_ALREADY_EXISTS);
    }

    @Test
    @DisplayName("하위 디렉토리 생성 성공")
    void createDirectory_Success() {
        // Given
        String parentPath = rootDir.getPath();
        String dirName = "newDir";

        // When
        FileNode newDir = fileService.createDirectory(parentPath, dirName);

        // Then
        FileNode foundDir = fileRepository.findByPath("/testRoot/newDir").orElse(null);
        assertThat(foundDir).isNotNull();
        assertThat(foundDir.getName()).isEqualTo(dirName);
        assertThat(foundDir.getParent()).isEqualTo(rootDir);
        assertThat(foundDir.getType()).isEqualTo(FileType.DIRECTORY);
    }

    @Test
    @DisplayName("하위 파일 생성 성공")
    void createFile_Success() {
        // Given
        String parentPath = rootDir.getPath();
        String fileName = "newFile.txt";
        String content = "Hello, World!";

        // When
        FileNode newFile = fileService.createFile(parentPath, fileName, content);

        // Then
        FileNode foundFile = fileRepository.findByPath("/testRoot/newFile.txt").orElse(null);
        assertThat(foundFile).isNotNull();
        assertThat(foundFile.getName()).isEqualTo(fileName);
        assertThat(foundFile.getParent()).isEqualTo(rootDir);
        assertThat(foundFile.getType()).isEqualTo(FileType.FILE);
        assertThat(foundFile.getContent()).isEqualTo(content);
    }

    @Test
    @DisplayName("디렉토리의 자식 노드 조회")
    void getChildren_Success() {
        // Given
        fileService.createDirectory(rootDir.getPath(), "subDir");
        fileService.createFile(rootDir.getPath(), "file.txt", "");

        // When
        List<FileNode> children = fileService.getChildren(rootDir.getPath());

        // Then
        assertThat(children).hasSize(2);
        // Type DECS, Name ASC 정렬 확인
        assertThat(children.get(0).getName()).isEqualTo("subDir");
        assertThat(children.get(0).getType()).isEqualTo(FileType.DIRECTORY);
        assertThat(children.get(1).getName()).isEqualTo("file.txt");
        assertThat(children.get(1).getType()).isEqualTo(FileType.FILE);
    }

    @Test
    @DisplayName("파일 내용 조회 성공")
    void getContent_Success() {
        // Given
        String content = "This is a test file.";
        FileNode file = fileService.createFile(rootDir.getPath(), "test.txt", content);

        // When
        String foundContent = fileService.getContent(file.getPath());

        // Then
        assertThat(foundContent).isEqualTo(content);
    }

    @Test
    @DisplayName("존재하지 않는 파일 내용 조회 시 예외 발생")
    void getContent_Fail_NotFound() {
        // Given
        String nonExistentPath = "/testRoot/nonexistent.txt";

        // When & Then
        BusinessException exception = assertThrows(BusinessException.class, () -> {
            fileService.getContent(nonExistentPath);
        });
        assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.FILE_NOT_FOUND);
    }

    @Test
    @DisplayName("파일 내용 업데이트 성공")
    void updateContent_Success() {
        // Given
        FileNode file = fileService.createFile(rootDir.getPath(), "updatable.txt", "Initial content");
        String newContent = "Updated content";

        // When
        fileService.updateContent(file.getPath(), newContent);

        // Then
        FileNode updatedFile = fileRepository.findById(file.getId()).orElse(null);
        assertThat(updatedFile).isNotNull();
        assertThat(updatedFile.getContent()).isEqualTo(newContent);
    }

    @Test
    @DisplayName("파일 및 디렉토리 이름 변경 성공 및 자식 경로 업데이트 확인")
    void rename_Success_AndUpdateChildrenPath() {
        // Given
        FileNode subDir = fileService.createDirectory(rootDir.getPath(), "subDir");
        FileNode fileInSubDir = fileService.createFile(subDir.getPath(), "child.txt", "");
        String oldSubDirPath = subDir.getPath();
        String oldFilePath = fileInSubDir.getPath();

        // When
        fileService.rename(oldSubDirPath, "renamedDir");

        // Then
        FileNode renamedDir = fileRepository.findByPath("/testRoot/renamedDir").orElse(null);
        assertThat(renamedDir).isNotNull();
        assertThat(renamedDir.getName()).isEqualTo("renamedDir");

        FileNode foundFile = fileRepository.findByPath("/testRoot/renamedDir/child.txt").orElse(null);
        assertThat(foundFile).isNotNull();
        assertThat(foundFile.getParent().getId()).isEqualTo(renamedDir.getId());

        // 이전 경로로 조회 시 없어야 함
        assertThat(fileRepository.findByPath(oldSubDirPath)).isEmpty();
        assertThat(fileRepository.findByPath(oldFilePath)).isEmpty();
    }

    @Test
    @DisplayName("파일 및 디렉토리 삭제 성공")
    void delete_Success() {
        // Given
        FileNode subDir = fileService.createDirectory(rootDir.getPath(), "dirToDelete");
        FileNode fileInSubDir = fileService.createFile(subDir.getPath(), "fileToDelete.txt", "");
        String dirPath = subDir.getPath();
        String filePath = fileInSubDir.getPath();

        // When
        fileService.delete(dirPath);
        em.flush();
        em.clear();

        // Then
        assertThat(fileRepository.findByPath(dirPath)).isEmpty();
        // 부모 디렉토리 삭제 시 자식 파일도 함께 삭제되는지 확인 (Cascade)
        assertThat(fileRepository.findByPath(filePath)).isEmpty();
    }

    @Test
    @DisplayName("존재하지 않는 파일 삭제 시 예외 발생")
    void delete_Fail_NotFound() {
        // Given
        String nonExistentPath = "/testRoot/nonexistent.txt";

        // When & Then
        BusinessException exception = assertThrows(BusinessException.class, () -> {
            fileService.delete(nonExistentPath);
        });
        assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.FILE_NOT_FOUND);
    }
}
