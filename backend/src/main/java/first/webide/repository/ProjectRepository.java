package first.webide.repository;

import first.webide.domain.Member;
import first.webide.domain.Project;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findAllByMember(Member member);

    Page<Project> findAllByIsPublic(boolean isPublic, Pageable pageable);
}
