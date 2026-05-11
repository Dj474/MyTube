package org.userservice.service.report;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.userservice.entity.report.Report;
import org.userservice.entity.user.User;
import org.userservice.other.enums.report.ReportReason;
import org.userservice.repository.report.ReportRepository;
import org.userservice.repository.user.UserRepository;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;

    @Transactional
    public void createReport(Long reporterId, Long targetUserId, String reason, String description) {
        if (reporterId.equals(targetUserId)) {
            throw new RuntimeException("Нельзя жаловаться на самого себя");
        }

        User reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new RuntimeException("Репортер не найден"));
        User target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("Цель жалобы не найдена"));

        Report report = Report.builder()
                .reporter(reporter)
                .targetUser(target)
                .reason(ReportReason.valueOf(reason.toUpperCase()))
                .description(description)
                .status("NEW")
                .build();

        reportRepository.save(report);
    }
}