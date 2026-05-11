package org.videoservice.controller.report;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.videoservice.service.report.VideoReportService;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/videos/report")
@RequiredArgsConstructor
public class VideoReportController {

    private final VideoReportService reportService;

    @PostMapping("/{videoId}")
    public ResponseEntity<Void> reportVideo(
            @PathVariable UUID videoId,
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody Map<String, String> body) {

        String reason = body.get("reason");
        String description = body.get("description");

        reportService.reportVideo(videoId, userId, reason, description);

        return ResponseEntity.ok().build();
    }
}