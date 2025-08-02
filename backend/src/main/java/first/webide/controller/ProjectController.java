package first.webide.controller;

import first.webide.dto.request.Project.CreateProjectRequest;
import first.webide.dto.request.Project.UpdateProjectPublishRequest;
import first.webide.dto.request.Project.UpdateProjectRequest;
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
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
@Tag(name = "Project  API", description = "프로젝트 관리 API")
public class ProjectController {

    private final ProjectService projectService;

    /**
     *  Create
     */
    @Operation(summary = "프로젝트 생성")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "프로젝트 생성 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
            @ApiResponse(responseCode = "404", description = "회원이 존재하지 않음")
    })
    @PostMapping("/members/{memberId}")
    public ResponseEntity<ProjectResponse> createProject(
            @Valid @RequestBody CreateProjectRequest request,
            @PathVariable("memberId") Long memberId) {
        ProjectResponse created = projectService.createProject(memberId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     *  Read
     */
    @Operation(summary = "회원별 프로젝트 목록 조회")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "프로젝트 목록 조회 성공"),
            @ApiResponse(responseCode = "404", description = "회원이 존재하지 않음")
    })
    @GetMapping("/members/{memberId}")
    public ResponseEntity<List<ProjectResponse>> getProjectsByMember(
            @PathVariable Long memberId) {
        List<ProjectResponse> projects = projectService.getProjectsByMember(memberId);
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

    /**
     * Update
     */

    @Operation(summary = "프로젝트 이름 및 설명 수정")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "프로젝트 정보 수정 성공"),
            @ApiResponse(responseCode = "404", description = "프로젝트나 회원을 찾을 수 없음"),
            @ApiResponse(responseCode = "403", description = "권한 없음"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청")
    })
    @PatchMapping("/members/{memberId}/{projectId}")
    public ResponseEntity<ProjectResponse> updateProjectInfo(
            @PathVariable Long memberId,
            @PathVariable Long projectId,
            @Valid @RequestBody UpdateProjectRequest request) {

        ProjectResponse updated = projectService.updateProjectInfo(memberId, projectId, request);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "프로젝트 공개/비공개 상태 변경")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "공개 상태 변경 성공"),
            @ApiResponse(responseCode = "404", description = "프로젝트나 회원을 찾을 수 없음"),
            @ApiResponse(responseCode = "403", description = "권한 없음")
    })
    @PatchMapping("/members/{memberId}/{projectId}/publish")
    public ResponseEntity<ProjectResponse> updateProjectPublish(
            @PathVariable Long memberId,
            @PathVariable Long projectId,
            @Valid @RequestBody UpdateProjectPublishRequest request) {
        ProjectResponse updated = projectService.updateProjectPublish(memberId, projectId, request);
        return ResponseEntity.ok(updated);
    }

    /**
     * Delete
     */
    @Operation(summary = "프로젝트 삭제")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "프로젝트 삭제 성공"),
            @ApiResponse(responseCode = "404", description = "프로젝트나 회원을 찾을 수 없음"),
            @ApiResponse(responseCode = "403", description = "권한 없음")
    })
    @DeleteMapping("/members/{memberId}/{projectId}")
    public ResponseEntity<Void> deleteProject(
            @PathVariable Long memberId,
            @PathVariable Long projectId) {
        projectService.deleteProject(memberId, projectId);
        return ResponseEntity.noContent().build();
    }
}
