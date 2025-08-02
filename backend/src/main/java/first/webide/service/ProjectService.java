package first.webide.service;

import first.webide.dto.request.Project.CreateProjectRequest;
import first.webide.dto.request.Project.UpdateProjectPublishRequest;
import first.webide.dto.request.Project.UpdateProjectRequest;
import first.webide.dto.response.ProjectHubResponse;
import first.webide.dto.response.ProjectResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface ProjectService {

    ProjectResponse createProject(Long memberId, CreateProjectRequest request);
    List<ProjectResponse> getProjectsByMember(Long memberId);

    @Transactional
    ProjectResponse updateProjectInfo(Long memberId, Long projectId, UpdateProjectRequest request);

    void deleteProject(Long memberId, Long projectId);
    ProjectResponse updateProjectPublish(Long memberId, Long projectId, UpdateProjectPublishRequest request);
    Page<ProjectHubResponse> getPublicProjects(Pageable pageable);
}
