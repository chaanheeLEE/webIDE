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

    ProjectResponse createProject(String memberEmail, CreateProjectRequest request);
    List<ProjectResponse> getProjectsByMemberEmail(String memberEmail);

    @Transactional
    ProjectResponse updateProjectInfo(String memberEmail, Long projectId, UpdateProjectRequest request);

    void deleteProject(String memberEmail, Long projectId);
    ProjectResponse updateProjectPublish(String memberEmail, Long projectId, UpdateProjectPublishRequest request);
    Page<ProjectHubResponse> getPublicProjects(Pageable pageable);
}
