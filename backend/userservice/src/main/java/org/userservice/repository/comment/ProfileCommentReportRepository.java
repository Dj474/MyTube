package org.userservice.repository.comment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.userservice.entity.comment.ProfileCommentReport;

@Repository
public interface ProfileCommentReportRepository extends JpaRepository<ProfileCommentReport, Long> {

    // Проверка на дубликат жалобы от одного и того же юзера
    boolean existsByReporterIdAndCommentId(Long reporterId, Long commentId);
}
