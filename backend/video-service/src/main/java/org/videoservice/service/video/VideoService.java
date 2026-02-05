package org.videoservice.service.video;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.videoservice.dto.video.VideoInfoDtoOut;
import org.videoservice.entity.video.Video;
import org.videoservice.other.enums.VideoStatus;
import org.videoservice.repository.video.VideoRepository;
import org.videoservice.service.minio.StorageService;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VideoService {

    private final VideoRepository videoRepository;
    private final StorageService storageService;
    // private final KafkaTemplate kafkaTemplate; // Добавим позже

    @Transactional
    public VideoInfoDtoOut upload(MultipartFile file, String title, String description, Long userId) {
        UUID videoId = UUID.randomUUID();

        // 1. Формируем путь (ключ) для S3
        String s3Key = String.format("temp/raw/%s-%s", videoId, file.getOriginalFilename());

        // 2. Сохраняем метаданные в БД
        Video video = Video.builder()
                .id(videoId)
                .title(title)
                .description(description)
                .userId(userId)
                .s3Key(s3Key)
                .status(VideoStatus.UPLOADING)
                .build();

        videoRepository.save(video);

        // 3. Загружаем сам файл в MinIO
        storageService.uploadFile(file, s3Key);

        // 4. TODO: Отправить сообщение в Kafka для обработки

        return mapToResponse(video);
    }

    private VideoInfoDtoOut mapToResponse(Video video) {
        return VideoInfoDtoOut.builder()
                .id(video.getId())
                .title(video.getTitle())
                .status(video.getStatus())
                .s3Key(video.getS3Key())
                .userId(video.getUserId())
                .build();
    }
}