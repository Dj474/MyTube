package org.videoservice.repository.report;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.videoservice.entity.report.VideoReport;

import java.util.UUID;

@Repository
public interface VideoReportRepository extends JpaRepository<VideoReport, Long> {
    // Проверка на дубликат жалобы
    boolean existsByVideoIdAndReporterId(UUID videoId, Long reporterId);
}