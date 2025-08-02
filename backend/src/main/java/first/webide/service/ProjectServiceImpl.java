package first.webide.service;

import first.webide.domain.FileNode;
import first.webide.domain.Member;
import first.webide.domain.Project;
import first.webide.dto.request.Project.CreateProjectRequest;
import first.webide.dto.request.Project.UpdateProjectPublishRequest;
import first.webide.dto.request.Project.UpdateProjectRequest;
import first.webide.dto.response.ProjectHubResponse;
import first.webide.dto.response.ProjectResponse;
import first.webide.exception.BusinessException;
import first.webide.exception.ErrorCode;
import first.webide.repository.FileRepository;
import first.webide.repository.MemberRepository;
import first.webide.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final FileRepository fileRepository;
    private final MemberRepository memberRepository;

    @Override
    @Transactional
    public ProjectResponse createProject(Long memberId, CreateProjectRequest request) {
        if (!memberRepository.existsById(memberId)) {
            throw new BusinessException(ErrorCode.MEMBER_NOT_FOUND);
        }
        Project project = Project.createProject(
                request.getName(),
                request.getDescription(),
                memberId);
        Project savedProject = projectRepository.save(project);

        FileNode rootDir = FileNode.createRootDirectory(savedProject.getName());
        FileNode savedRootDir = fileRepository.save(rootDir);
        savedProject.linkRootDirectory(savedRootDir.getId());
        return ProjectResponse.from(savedProject);
    }

    @Override
    public List<ProjectResponse> getProjectsByMember(Long memberId) {
        if (!memberRepository.existsById(memberId)) {
            throw new BusinessException(ErrorCode.MEMBER_NOT_FOUND);
        }
        List<Project> projects = projectRepository.findAllByMemberId(memberId);
        return projects.stream()
                .map(ProjectResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    @Override
    public ProjectResponse updateProjectInfo(Long memberId, Long projectId, UpdateProjectRequest request){
        if (!memberRepository.existsById(memberId)) {
            throw new BusinessException(ErrorCode.MEMBER_NOT_FOUND);
        }
        if (!projectRepository.existsById(projectId)) {
            throw new BusinessException(ErrorCode.PROJECT_NOT_FOUND);
        }
        Project project = getProjectAndCheckOwnership(memberId, projectId);

        project.rename(request.getName());
        project.updateDescription(request.getDescription());
        return  ProjectResponse.from(project);
    }

    @Override
    @Transactional
    public void deleteProject(Long memberId, Long projectId) {
        Project project = getProjectAndCheckOwnership(memberId, projectId);
        if (project.getRootDirId() != null) {
            fileRepository.deleteById(project.getRootDirId());
        }
        projectRepository.delete(project);
    }

    @Override
    public Page<ProjectHubResponse> getPublicProjects(Pageable pageable) {
        Page<Project> publicProjects = projectRepository.findAllByIsPublic(true, pageable);

        // 사용자 정보를 한 번에 조회
        List<Long> ownerIds = publicProjects.getContent().stream()
                .map(Project::getMemberId)
                .distinct()
                .toList();

        Map<Long, Member> ownersMap = memberRepository.findAllById(ownerIds).stream()
                .collect(Collectors.toMap(Member::getId, Function.identity()));

        return publicProjects.map(project -> {
            Member owner = ownersMap.get(project.getMemberId());
            if (owner == null) {
                throw new BusinessException(ErrorCode.MEMBER_NOT_FOUND);
            }
            return new ProjectHubResponse(project, owner);
        });
    }

    @Override
    @Transactional
    public ProjectResponse updateProjectPublish(Long memberId, Long projectId, UpdateProjectPublishRequest request) {
        Project project = getProjectAndCheckOwnership(memberId, projectId);
        if (request.getIsPublic()) {
            project.publish();
        } else {
            project.unpublish();
        }
        return ProjectResponse.from(project);
    }

    private Project getProjectAndCheckOwnership(Long memberId, Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND));
        if (!project.getMemberId().equals(memberId)) {
            throw new BusinessException(ErrorCode.HANDLE_ACCESS_DENIED);
        }
        return project;
    }
}
