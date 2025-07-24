package first.webide.controller;

import first.webide.domain.FileNode;
import first.webide.dto.request.FileNode.*;
import first.webide.dto.response.FileNodeResponse;
import first.webide.service.FileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@Tag(name = "File API", description = "파일 및 디렉토리 관리 API")
public class FileController {
    private final FileService fileService;

    /**
     * Create
     */

    @Operation(summary = "루트 디렉토리 생성")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "루트 디렉토리 생성 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
            @ApiResponse(responseCode = "409", description = "이미 존재하는 루트 디렉토리")
    })
    @PostMapping("/root")
    public ResponseEntity<FileNodeResponse> createRootDirectory(
            @Valid @RequestBody CreateRootDirectoryRequest request) {
        FileNode rootDir = fileService.createRootDirectory(request.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(FileNodeResponse.from(rootDir));
    }

    @Operation(summary = "하위 디렉토리 생성")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "디렉토리 생성 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
            @ApiResponse(responseCode = "404", description = "부모 디렉토리를 찾을 수 없음")
    })
    @PostMapping("/directories")
    public ResponseEntity<FileNodeResponse> createDirectory(
            @Valid @RequestBody CreateDirectoryRequest request) {
        FileNode dir = fileService.createDirectory(
                request.getParentPath(), request.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(FileNodeResponse.from(dir));
    }

    @Operation(summary = "파일 생성")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "파일 생성 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
            @ApiResponse(responseCode = "404", description = "부모 디렉토리를 찾을 수 없음")
    })
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
    @Operation(summary = "루트 디렉토리 조회")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "루트 디렉토리 조회 성공"),
            @ApiResponse(responseCode = "404", description = "루트 디렉토리를 찾을 수 없음")
    })
    @GetMapping("/root")
    public ResponseEntity<FileNodeResponse> getRootDirectory(){
        FileNode root = fileService.getRootDirectory();
        FileNodeResponse response = FileNodeResponse.from(root);
        return ResponseEntity.ok(response);
    }

    // GET /api/files/children?path=/project/src
    @Operation(summary = "디렉토리의 자식 노드 조회")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "하위 목록 조회 성공"),
            @ApiResponse(responseCode = "404", description = "지정된 경로를 찾을 수 없음")
    })
    @Parameter(name = "path", description = "부모 디렉토리의 경로", required = true)
    @GetMapping("/children")
    public ResponseEntity<List<FileNodeResponse>> getChildren(
            @RequestParam String path){
        List<FileNode> children = fileService.getChildren(path);
        List<FileNodeResponse> responses = children.stream()
                .map(FileNodeResponse::from).toList();

        return ResponseEntity.ok(responses);
    }

    // GET /api/files/content?path=/project/src/main.java
    @Operation(summary = "파일 내용 조회")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "파일 내용 조회 성공"),
            @ApiResponse(responseCode = "404", description = "파일을 찾을 수 없음"),
            @ApiResponse(responseCode = "400", description = "디렉토리는 내용을 조회할 수 없음")
    })
    @Parameter(name = "path", description = "파일 경로", required = true)
    @GetMapping("/content")
    public ResponseEntity<String> getContent(@RequestParam String path){
        String content = fileService.getContent(path);
        return ResponseEntity.ok(content);
    }

    /**
     * Update
     */
    @Operation(summary = "파일 내용 수정")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "파일 내용 수정 성공"),
            @ApiResponse(responseCode = "404", description = "파일을 찾을 수 없음"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청")
    })
    @PatchMapping("/content")
    public ResponseEntity<FileNodeResponse> updateContent(
            @RequestParam String path,
            @Valid @RequestBody UpdateFileContentRequest request){
        FileNode file = fileService.updateContent(path, request.getContent());
        return ResponseEntity.ok(FileNodeResponse.from(file));
    }

    @Operation(summary = "파일 또는 디렉토리 이름 변경")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "이름 변경 성공"),
            @ApiResponse(responseCode = "404", description = "파일/디렉토리를 찾을 수 없음"),
            @ApiResponse(responseCode = "409", description = "동일한 이름이 이미 존재함")
    })
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
    @Operation(summary = "파일 또는 디렉토리 삭제")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "삭제 성공"),
            @ApiResponse(responseCode = "404", description = "파일/디렉토리를 찾을 수 없음")
    })
    @Parameter(name = "path", description = "삭제할 노드의 경로", required = true)
    @DeleteMapping
    public ResponseEntity<Void> delete(@RequestParam String path) {
        fileService.delete(path);
        return ResponseEntity.noContent().build();
    }

}
