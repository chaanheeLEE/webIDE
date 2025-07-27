package first.webide.repository;

import first.webide.domain.FileNode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FileRepository extends JpaRepository<FileNode,Long> {

    Optional<FileNode> findByPath(String path);

    List<FileNode> findByParentOrderByTypeDescNameAsc(FileNode parent);

    @Query("select distinct f from FileNode f left join fetch f.children where f.parent is null")
    Optional<FileNode> findByParentIsNull();

    boolean existsByParentAndName(FileNode parent, String name);

}
