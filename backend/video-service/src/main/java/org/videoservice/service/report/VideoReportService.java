package org.videoservice.service.report;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.videoservice.entity.report.VideoReport;
import org.videoservice.exception.BadRequestException;
import org.videoservice.exception.NotFoundException;
import org.videoservice.other.enums.VideoReportReason;
import org.videoservice.repository.report.VideoReportRepository;
import org.videoservice.repository.video.VideoRepository;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VideoReportService {

    private final VideoReportRepository reportRepository;
    private final VideoRepository videoRepository;

    @Transactional
    public void reportVideo(UUID videoId, Long reporterId, String reason, String description) {
        // 1. Проверяем, существует ли видео
        if (!videoRepository.existsById(videoId)) {
            throw new NotFoundException("Видео не найдено");
        }

        // 2. Проверяем, не кидал ли этот юзер репорт ранее (опционально)
        if (reportRepository.existsByVideoIdAndReporterId(videoId, reporterId)) {
            throw new BadRequestException("Вы уже пожаловались на это видео");
        }

        // 3. Сохраняем
        VideoReport report = VideoReport.builder()
                .videoId(videoId)
                .reporterId(reporterId)
                .reason(VideoReportReason.valueOf(reason.toUpperCase()))
                .description(description)
                .build();

        reportRepository.save(report);
    }
}