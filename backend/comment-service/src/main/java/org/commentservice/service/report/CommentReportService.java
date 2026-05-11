package org.commentservice.service.report;

import lombok.RequiredArgsConstructor;
import org.commentservice.exception.BadRequestException;
import org.commentservice.repository.comment.CommentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.commentservice.entity.report.CommentReport;
import org.commentservice.repository.report.CommentReportRepository;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CommentReportService {

    private final CommentReportRepository reportRepository;
    private final CommentRepository commentRepository;

    @Transactional
    public void reportComment(UUID commentId, Long userId, String reason, String description) {
        // 1. Проверяем существование комментария
        if (!commentRepository.existsById(commentId)) {
            throw new BadRequestException("Comment not found");
        }

        // 2. Проверяем на дубликат жалобы
        if (reportRepository.existsByCommentIdAndReporterId(commentId, userId)) {
            throw new BadRequestException("You have already reported this comment");
        }

        // 3. Создаем и сохраняем репорт
        CommentReport report = CommentReport.builder()
                .commentId(commentId)
                .reporterId(userId)
                .reason(reason)
                .description(description)
                .build();

        reportRepository.save(report);
    }
}