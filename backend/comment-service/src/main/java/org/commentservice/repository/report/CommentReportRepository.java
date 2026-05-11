package org.commentservice.repository.report;

import org.commentservice.entity.report.CommentReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface CommentReportRepository extends JpaRepository<CommentReport, Long> {
    // Проверка, не жаловался ли уже этот юзер на этот коммент
    boolean existsByCommentIdAndReporterId(UUID commentId, Long reporterId);
}
