package org.userservice.repository.report;

import org.springframework.data.jpa.repository.JpaRepository;
import org.userservice.entity.report.Report;
import org.springframework.stereotype.Repository;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    // Можно добавить метод, чтобы проверить, не жаловался ли уже юзер на этого человека
    boolean existsByReporterIdAndTargetUserIdAndStatus(Long reporterId, Long targetUserId, String status);
}
