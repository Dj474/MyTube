package org.userservice.controller.report;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.userservice.service.report.ReportService;

@RestController
@RequestMapping("/api/v1/users/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @PostMapping("/{targetUserId}")
    public void sendReport(@PathVariable Long targetUserId,
                           @RequestHeader("X-User-Id") Long reporterId,
                           @RequestBody ReportDto dto) {
        reportService.createReport(reporterId, targetUserId, dto.getReason(), dto.getDescription());
    }
}

// Простой DTO для входящих данных
@lombok.Data
class ReportDto {
    private String reason;
    private String description;
}