package first.webide.controller;

import first.webide.config.auth.UserDetailsImpl;
import first.webide.dto.request.Project.CreateProjectRequest;
import first.webide.dto.request.Project.UpdateProjectPublishRequest;
import first.webide.dto.request.Project.UpdateProjectRequest;
import first.webide.dto.response.FileNodeResponse;
import first.webide.dto.response.ProjectHubResponse;
import first.webide.dto.response.ProjectResponse;
import first.webide.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@Tag(name = "Project  API", description = "프로젝트 관리 API")
public class ProjectController {

    private final ProjectService projectService;

    /**
     *  Create
     */
    @Operation(summary = "프로젝트 생성 (인증 필요)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "프로젝트 생성 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자")
    })
    @PostMapping
    public ResponseEntity<ProjectResponse> createProject(
            @Valid @RequestBody CreateProjectRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        String memberEmail = userDetails.getMember().getEmail();
        ProjectResponse created = projectService.createProject(memberEmail, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     *  Read
     */
    @Operation(summary = "내 프로젝트 목록 조회 (인증 필요)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "프로젝트 목록 조회 성공"),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자")
    })
    @GetMapping("/my")
    public ResponseEntity<List<ProjectResponse>> getMyProjects(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        String memberEmail = userDetails.getMember().getEmail();
        List<ProjectResponse> projects = projectService.getProjectsByMemberEmail(memberEmail);
        return ResponseEntity.ok(projects);
    }

    @Operation(summary = "공개 프로젝트 목록 조회 (페이징)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "공개 프로젝트 목록 조회 성공")
    })
    @GetMapping("/public")
    public ResponseEntity<Page<ProjectHubResponse>> getPublicProjects(Pageable pageable) {
        Page<ProjectHubResponse> publicProjects = projectService.getPublicProjects(pageable);
        return ResponseEntity.ok(publicProjects);
    }

    @Operation(summary = "프로젝트 상세 정보 조회")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "프로젝트 정보 조회 성공"),
            @ApiResponse(responseCode = "404", description = "프로젝트를 찾을 수 없음")
    })
    @GetMapping("/{projectId}")
    public ResponseEntity<ProjectResponse> getProjectDetails(@PathVariable Long projectId) {
        ProjectResponse project = projectService.getProjectDetails(projectId);
        return ResponseEntity.ok(project);
    }

    /**
     * Update
     */

    @Operation(summary = "프로젝트 이름 및 설명 수정 (인증 필요)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "프로젝트 정보 수정 성공"),
            @ApiResponse(responseCode = "404", description = "프로젝트를 찾을 수 없음"),
            @ApiResponse(responseCode = "403", description = "권한 없음"),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자")
    })
    @PatchMapping("/{projectId}")
    public ResponseEntity<ProjectResponse> updateProjectInfo(
            @PathVariable Long projectId,
            @Valid @RequestBody UpdateProjectRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        String memberEmail = userDetails.getMember().getEmail();
        ProjectResponse updated = projectService.updateProjectInfo(memberEmail, projectId, request);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "프로젝트 공개/비공개 상태 변경 (인증 필요)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "공개 상태 변경 성공"),
            @ApiResponse(responseCode = "404", description = "프로젝트를 찾을 수 없음"),
            @ApiResponse(responseCode = "403", description = "권한 없음"),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자")
    })
    @PatchMapping("/{projectId}/publish")
    public ResponseEntity<ProjectResponse> updateProjectPublish(
            @PathVariable Long projectId,
            @Valid @RequestBody UpdateProjectPublishRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        String memberEmail = userDetails.getMember().getEmail();
        ProjectResponse updated = projectService.updateProjectPublish(memberEmail, projectId, request);
        return ResponseEntity.ok(updated);
    }

    /**
     * Delete
     */
    @Operation(summary = "프로젝트 삭제 (인증 필요)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "프로젝트 삭제 성공"),
            @ApiResponse(responseCode = "404", description = "프로젝트를 찾을 수 없음"),
            @ApiResponse(responseCode = "403", description = "권한 없음"),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자")
    })
    @DeleteMapping("/{projectId}")
    public ResponseEntity<Void> deleteProject(
            @PathVariable Long projectId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        String memberEmail = userDetails.getMember().getEmail();
        projectService.deleteProject(memberEmail, projectId);
        return ResponseEntity.noContent().build();
    }

    /**
     * 프로젝트 루트 디렉토리 조회
     */
    @Operation(summary = "프로젝트 루트 디렉토리 조회 (인증 필요)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "루트 디렉토리 조회 성공"),
            @ApiResponse(responseCode = "404", description = "프로젝트를 찾을 수 없음"),
            @ApiResponse(responseCode = "403", description = "권한 없음"),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자")
    })
    @GetMapping("/{projectId}/files/root")
    public ResponseEntity<FileNodeResponse> getProjectRootDirectory(
            @PathVariable Long projectId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        String memberEmail = userDetails.getMember().getEmail();
        FileNodeResponse rootDir = projectService.getProjectRootDirectory(memberEmail, projectId);
        return ResponseEntity.ok(rootDir);
    }

    @Operation(summary = "공개 프로젝트 루트 디렉토리 조회 (인증 불필요)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "루트 디렉토리 조회 성공"),
            @ApiResponse(responseCode = "404", description = "프로젝트를 찾을 수 없음"),
            @ApiResponse(responseCode = "403", description = "비공개 프로젝트")
    })
    @GetMapping("/{projectId}/files/root/public")
    public ResponseEntity<FileNodeResponse> getPublicProjectRootDirectory(@PathVariable Long projectId) {
        FileNodeResponse rootDir = projectService.getPublicProjectRootDirectory(projectId);
        return ResponseEntity.ok(rootDir);
    }
}
