package first.webide.controller;

import first.webide.domain.FileNode;
import first.webide.dto.request.FileNode.*;
import first.webide.dto.response.FileNodeResponse;
import first.webide.service.FileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {
    private final FileService fileService;

    /**
     * Create
     */

    @PostMapping("/root")
    public ResponseEntity<FileNodeResponse> createRootDirectory(
            @Valid @RequestBody CreateRootDirectoryRequest request) {
        FileNode rootDir = fileService.createRootDirectory(request.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(FileNodeResponse.from(rootDir));
    }

    @PostMapping("/directories")
    public ResponseEntity<FileNodeResponse> createDirectory(
            @Valid @RequestBody CreateDirectoryRequest request) {
        FileNode dir = fileService.createDirectory(
                request.getParentPath(), request.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(FileNodeResponse.from(dir));
    }

    @PostMapping
    public ResponseEntity<FileNodeResponse> createFile(
            @Valid @RequestBody CreateFileRequest request){
        FileNode file = fileService.createFile(
                request.getParentPath(), request.getName(), request.getContent());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(FileNodeResponse.from(file));
    }

    /**
     * Read
     */
    @GetMapping("/root")
    public ResponseEntity<FileNodeResponse> getRootDirectory(){
        FileNode root = fileService.getRootDirectory();
        FileNodeResponse response = FileNodeResponse.from(root);
        return ResponseEntity.ok(response);
    }

    // GET /api/files/children?path=/project/src
    @GetMapping("/children")
    public ResponseEntity<List<FileNodeResponse>> getChildren(
            @RequestParam String path){
        List<FileNode> children = fileService.getChildren(path);
        List<FileNodeResponse> responses = children.stream()
                .map(FileNodeResponse::from).toList();

        return ResponseEntity.ok(responses);
    }
    // GET /api/files/content?path=/project/src/main.java
    @GetMapping("/content")
    public ResponseEntity<String> getContent(@RequestParam String path){
        String content = fileService.getContent(path);
        return ResponseEntity.ok(content);
    }

    /**
     * Update
     */
    @PatchMapping("/content")
    public ResponseEntity<FileNodeResponse> updateContent(
            @RequestParam String path,
            @Valid @RequestBody UpdateFileContentRequest request){
        FileNode file = fileService.updateContent(path, request.getContent());
        return ResponseEntity.ok(FileNodeResponse.from(file));
    }

    @PatchMapping("/rename")
    public ResponseEntity<FileNodeResponse> rename(
            @RequestParam String path,
            @Valid @RequestBody RenameRequest request) {
        FileNode renamed = fileService.rename(path, request.getNewName());
        return ResponseEntity.ok(FileNodeResponse.from(renamed));
    }

    /**
     * Delete
     */
    @DeleteMapping
    public ResponseEntity<Void> delete(@RequestParam String path) {
        fileService.delete(path);
        return ResponseEntity.noContent().build();
    }

}
