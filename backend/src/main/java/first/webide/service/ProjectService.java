package first.webide.service;

import first.webide.dto.request.Project.CreateProjectRequest;
import first.webide.dto.request.Project.UpdateProjectPublishRequest;
import first.webide.dto.request.Project.UpdateProjectRequest;
import first.webide.dto.response.FileNodeResponse;
import first.webide.dto.response.ProjectHubResponse;
import first.webide.dto.response.ProjectResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface ProjectService {

    ProjectResponse createProject(String memberEmail, CreateProjectRequest request);
    List<ProjectResponse> getProjectsByMemberEmail(String memberEmail);
    ProjectResponse getProjectDetails(Long projectId);

    @Transactional
    ProjectResponse updateProjectInfo(String memberEmail, Long projectId, UpdateProjectRequest request);

    void deleteProject(String memberEmail, Long projectId);
    ProjectResponse updateProjectPublish(String memberEmail, Long projectId, UpdateProjectPublishRequest request);
    Page<ProjectHubResponse> getPublicProjects(Pageable pageable);
    
    // 프로젝트 루트 디렉토리 조회 (소유권 검사)
    FileNodeResponse getProjectRootDirectory(String memberEmail, Long projectId);
    
    // 공개 프로젝트 루트 디렉토리 조회 (소유권 검사 없음)
    FileNodeResponse getPublicProjectRootDirectory(Long projectId);
}
