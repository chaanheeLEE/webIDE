package first.webide.service;

import first.webide.domain.Member;
import first.webide.domain.MemberRole;
import first.webide.domain.Project;
import first.webide.dto.request.Project.CreateProjectRequest;
import first.webide.dto.request.Project.UpdateProjectPublishRequest;
import first.webide.dto.request.Project.UpdateProjectRequest;
import first.webide.dto.response.ProjectHubResponse;
import first.webide.dto.response.ProjectResponse;
import first.webide.exception.BusinessException;
import first.webide.exception.ErrorCode;
import first.webide.repository.MemberRepository;
import first.webide.repository.ProjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class ProjectServiceImplTest {

    @Autowired
    private ProjectRepository projectRepository;
    @Autowired
    private MemberRepository memberRepository;
    @Autowired
    private ProjectService projectService;

    private Long memberId;
    private Project savedProject;


    @BeforeEach
    void setUp() {
        // 테스트용 멤버 생성
        Member member = Member.builder()
                .email("test@test")
                .password("test")
                .username("test")
                .role(MemberRole.USER)
                .build();

        Member savedMember = memberRepository.save(member);
        memberId = savedMember.getId();


        // 테스트용 프로젝트 생성
        CreateProjectRequest request = CreateProjectRequest.builder()
                .name("test project")
                .description("test Description")
                .build();

        ProjectResponse response = projectService.createProject(memberId, request);
        savedProject = projectRepository.findById(response.getId()).orElseThrow();
    }

    @Test
    @DisplayName("프로젝트 저장")
    void createProject() {
        // given

        //then
        assertThat(savedProject).isNotNull();
        assertThat(savedProject.getName()).isEqualTo("test project");
        assertThat(savedProject.getDescription()).isEqualTo("test Description");
        assertThat(savedProject.getMemberId()).isEqualTo(memberId);
        assertThat(savedProject.getId()).isNotNull();

    }

    @Test
    @DisplayName("프로젝트 이름 및 설명 수정 성공")
    void updateProjectInfo_Success() {
        // given
        UpdateProjectRequest updateReq = new UpdateProjectRequest(
                "update project", "update Description");

        //when
        ProjectResponse response = projectService.updateProjectInfo(memberId, savedProject.getId(), updateReq);

        // then
        assertThat(response).isNotNull();
        assertThat(response.getName()).isEqualTo("update project");
        assertThat(response.getDescription()).isEqualTo("update Description");

        Project project = projectRepository.findById(savedProject.getId()).orElseThrow();
        assertThat(project.getName()).isEqualTo(savedProject.getName());
        assertThat(project.getDescription()).isEqualTo(savedProject.getDescription());
    }

    @Test
    @DisplayName("프로젝트가 존재하지 않는 경우 수정 시 예외 발생")
    void updateProjectInfo_Fail_ProjectNotFound(){
        // given
        Long projectId = 99L;
        UpdateProjectRequest updateReq = new UpdateProjectRequest("update project", "update Description");

        // when
        BusinessException exception = assertThrows(BusinessException.class, () ->projectService.updateProjectInfo(memberId, projectId, updateReq));

        // then
        assertThat(exception).isNotNull();
        assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.PROJECT_NOT_FOUND);
    }

    @Test
    @DisplayName("프로젝트 소유자가 아닌 경우 수정 시 권한 예외 발생")
    void updateProjectInfo_Fail_AccessDenied() {
        // given
        Member Member2 = Member.builder()
                .email("test2@test2")
                .password("test2")
                .username("test2")
                .role(MemberRole.USER)
                .build();

        Member savedMember2 = memberRepository.save(Member2);
        Long member2Id = savedMember2.getId();

        UpdateProjectRequest updateReq = new UpdateProjectRequest("test2", "update test2");

        // when
        BusinessException exception = assertThrows(BusinessException.class,
                () ->projectService.updateProjectInfo(member2Id, savedProject.getId(), updateReq));

        // then
        assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.HANDLE_ACCESS_DENIED);
    }

    @Test
    @DisplayName("공개된 프로젝트 목록 조회 성공")
    void getPublicProjects() {
        // given
        Member member = Member.builder()
                .email("public@test.com")
                .password("test")
                .username("publicUser")
                .role(MemberRole.USER)
                .build();
        Member savedMember = memberRepository.save(member);

        for (int i = 0; i < 3; i++) {
            CreateProjectRequest request = CreateProjectRequest.builder()
                    .name("Public Project " + i)
                    .description("Description " + i)
                    .build();
            ProjectResponse created = projectService.createProject(savedMember.getId(), request);

            UpdateProjectPublishRequest publishRequest = new UpdateProjectPublishRequest(true);
            projectService.updateProjectPublish(savedMember.getId(),created.getId(), publishRequest);
        }

        // when
        Pageable pageable = PageRequest.of(0, 3);
        Page<ProjectHubResponse> publicProjects = projectService.getPublicProjects(pageable);

        // then
        assertThat(publicProjects).isNotNull();
        assertThat(publicProjects.getContent()).hasSize(3);
    }

    @Test
    @DisplayName("프로젝트 공개 상태 업데이트 성공")
    void updateProjectPublish() {
        // given
        CreateProjectRequest createReq = CreateProjectRequest.builder()
                .name("private project")
                .description("description")
                .build();
        ProjectResponse created = projectService.createProject(memberId, createReq);

        //when
        UpdateProjectPublishRequest updateReq = new UpdateProjectPublishRequest(true);
        ProjectResponse updated = projectService.updateProjectPublish(memberId, created.getId(), updateReq);

        //then
        assertThat(updated).isNotNull();
        assertThat(updated.getName()).isEqualTo(createReq.getName());
        assertThat(updated.getDescription()).isEqualTo(createReq.getDescription());

        Project project = projectRepository.findById(created.getId()).orElseThrow();
        assertThat(project.isPublic()).isTrue();
    }

    @Test
    @DisplayName("프로젝트 삭제 성공")
    void deleteProject() {
        // give
        CreateProjectRequest createRequest = CreateProjectRequest.builder()
                .name("Project To Delete")
                .description("To be deleted")
                .build();
        ProjectResponse created = projectService.createProject(memberId, createRequest);

        Long projectId = created.getId();

        // when
        projectService.deleteProject(memberId, projectId);

        // then
        assertThat(projectRepository.findById(projectId)).isEmpty();
    }
}