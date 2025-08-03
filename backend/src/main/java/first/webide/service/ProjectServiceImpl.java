package first.webide.service;

import first.webide.domain.FileNode;
import first.webide.domain.Member;
import first.webide.domain.Project;
import first.webide.dto.request.Project.CreateProjectRequest;
import first.webide.dto.request.Project.UpdateProjectPublishRequest;
import first.webide.dto.request.Project.UpdateProjectRequest;
import first.webide.dto.response.FileNodeResponse;
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
    public ProjectResponse createProject(String memberEmail, CreateProjectRequest request) {
        Member member = memberRepository.findByEmail(memberEmail)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        Project project = Project.createProject(
                request.getProjectName(),
                request.getDescription(),
                member);
        Project savedProject = projectRepository.save(project);

        FileNode rootDir = FileNode.createRootDirectory(savedProject.getName());
        FileNode savedRootDir = fileRepository.save(rootDir);
        savedProject.linkRootDirectory(savedRootDir.getId());
        return ProjectResponse.from(savedProject);
    }

    @Override
    public List<ProjectResponse> getProjectsByMemberEmail(String memberEmail) {
        Member member = memberRepository.findByEmail(memberEmail)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));
        List<Project> projects = projectRepository.findAllByMember(member);
        return projects.stream()
                .map(ProjectResponse::from)
                .collect(Collectors.toList());
    }

    @Override
    public ProjectResponse getProjectDetails(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PROJECT_NOT_FOUND));
        
        Member owner = project.getMember();
        
        return ProjectResponse.from(project, owner.getEmail());
    }

    @Transactional
    @Override
    public ProjectResponse updateProjectInfo(String memberEmail, Long projectId, UpdateProjectRequest request){
        Member member = memberRepository.findByEmail(memberEmail)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));
        Project project = getProjectAndCheckOwnership(member.getId(), projectId);

        project.rename(request.getName());
        project.updateDescription(request.getDescription());
        return  ProjectResponse.from(project);
    }

    @Override
    @Transactional
    public void deleteProject(String memberEmail, Long projectId) {
        Member member = memberRepository.findByEmail(memberEmail)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));
        Project project = getProjectAndCheckOwnership(member.getId(), projectId);
        if (project.getRootDirId() != null) {
            fileRepository.deleteById(project.getRootDirId());
        }
        projectRepository.delete(project);
    }

    @Override
    public Page<ProjectHubResponse> getPublicProjects(Pageable pageable) {
        Page<Project> publicProjects = projectRepository.findAllByIsPublic(true, pageable);

        return publicProjects.map(project -> {
            Member owner = project.getMember();
            return new ProjectHubResponse(project, owner);
        });
    }

    @Override
    @Transactional
    public ProjectResponse updateProjectPublish(String memberEmail, Long projectId, UpdateProjectPublishRequest request) {
        Member member = memberRepository.findByEmail(memberEmail)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));
        Project project = getProjectAndCheckOwnership(member.getId(), projectId);
        if (request.getIsPublic()) {
            project.publish();
        } else {
            project.unpublish();
        }
        return ProjectResponse.from(project);
    }

    @Override
    public FileNodeResponse getProjectRootDirectory(String memberEmail, Long projectId) {
        Member member = memberRepository.findByEmail(memberEmail)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));
        Project project = getProjectAndCheckOwnership(member.getId(), projectId);
        
        if (project.getRootDirId() == null) {
            throw new BusinessException(ErrorCode.FILE_NOT_FOUND);
        }
        
        FileNode rootDir = fileRepository.findById(project.getRootDirId())
                .orElseThrow(() -> new BusinessException(ErrorCode.FILE_NOT_FOUND));
        
        return FileNodeResponse.from(rootDir);
    }

    @Override
    public FileNodeResponse getPublicProjectRootDirectory(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PROJECT_NOT_FOUND));
        
        // 공개 프로젝트인지 확인
        if (!project.isPublic()) {
            throw new BusinessException(ErrorCode.HANDLE_ACCESS_DENIED);
        }
        
        if (project.getRootDirId() == null) {
            throw new BusinessException(ErrorCode.FILE_NOT_FOUND);
        }
        
        FileNode rootDir = fileRepository.findById(project.getRootDirId())
                .orElseThrow(() -> new BusinessException(ErrorCode.FILE_NOT_FOUND));
        
        return FileNodeResponse.from(rootDir);
    }

    private Project getProjectAndCheckOwnership(Long memberId, Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PROJECT_NOT_FOUND));
        if (!project.getMember().getId().equals(memberId)) {
            throw new BusinessException(ErrorCode.HANDLE_ACCESS_DENIED);
        }
        return project;
    }
}
