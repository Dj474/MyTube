package org.videoservice.controller.history;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;
import org.videoservice.dto.history.HistoryDtoIn;
import org.videoservice.dto.history.HistoryDtoOut;
import org.videoservice.service.history.HistoryService;
import org.videoservice.specification.PageableParams;

@RestController
@RequestMapping("api/v1/videos/history")
@RequiredArgsConstructor
public class HistoryController {

    private final HistoryService historyService;

    @PostMapping
    public void addToHistory(@RequestBody HistoryDtoIn dtoIn,
                             @RequestHeader("X-User-Id") Long userId) {
        historyService.addToHistory(dtoIn, userId);
    }

    @GetMapping
    public Page<HistoryDtoOut> getHistory(@RequestHeader("X-User-Id") Long userId,
                                          PageableParams params) {
        return historyService.getHistory(params, userId);
    }

}
