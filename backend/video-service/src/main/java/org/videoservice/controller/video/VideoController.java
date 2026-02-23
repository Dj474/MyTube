package org.videoservice.controller.video;

import org.springframework.core.io.Resource;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.videoservice.dto.video.VideoInfoDtoOut;
import org.videoservice.service.video.VideoService;
import org.videoservice.specification.PageableParams;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/videos")
@RequiredArgsConstructor
public class VideoController {

    private final VideoService videoService;

    @PostMapping("/upload")
    public VideoInfoDtoOut uploadVideo(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestHeader("X-User-Id") Long userId // Получаем ID из Gateway
    ) {
        // Логика:
        // 1. Создать запись в БД (UPLOADING)
        // 2. Отправить файл в S3
        // 3. Отправить событие в Kafka (для обработки в HLS)

        return videoService.upload(file, title, description, userId);
    }

    @GetMapping("/{id}")
    public VideoInfoDtoOut getVideoById(@PathVariable UUID id) {
        return videoService.getVideoById(id);
    }

    @GetMapping()
    public Page<VideoInfoDtoOut> getVideos(@RequestBody PageableParams params) {
        return videoService.getVideos(params);
    }

    @GetMapping("/my")
    public Page<VideoInfoDtoOut> getMyVideos(@RequestBody PageableParams params, @RequestHeader("X-User-Id") Long userId) {
        return videoService.getMyVideos(params, userId);
    }

    @GetMapping("/previev/{videoId}")
    public ResponseEntity<Resource> getThumbnail(@PathVariable UUID videoId) {
        return videoService.getThumbnail(videoId);
    }

    @GetMapping("/subscription")
    public Page<VideoInfoDtoOut> getSubscriptionVideos(@RequestBody PageableParams params, @RequestHeader("X-User-Id") Long userId) {
        return videoService.getSubscriptionVideos(params, userId);
    }

}