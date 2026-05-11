package org.commentservice.controller.report;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.commentservice.service.report.CommentReportService;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/comments/report")
@RequiredArgsConstructor
public class CommentReportController {

    private final CommentReportService reportService;

    @PostMapping("/{commentId}")
    public ResponseEntity<Void> reportComment(
            @PathVariable UUID commentId,
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody Map<String, String> body) {

        String reason = body.get("reason");
        String description = body.get("description");

        reportService.reportComment(commentId, userId, reason, description);

        return ResponseEntity.ok().build();
    }
}