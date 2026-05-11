package org.userservice.controller.report;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.userservice.service.report.ReportService;

@RestController
@RequestMapping("/api/v1/profile/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @PostMapping("/{targetUserId}")
    public void sendReport(@PathVariable Long targetUserId,
                           @RequestBody ReportDto dto) {
        reportService.createReport(targetUserId, dto.getReason(), dto.getDescription());
    }
}
