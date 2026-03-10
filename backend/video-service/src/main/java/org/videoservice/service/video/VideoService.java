package org.videoservice.service.video;

import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.videoservice.dto.video.VideoInfoDtoOut;
import org.videoservice.dto.video.VideoUploadDto;
import org.videoservice.entity.tag.Tag;
import org.videoservice.entity.video.Video;
import org.videoservice.entity.video.Video_;
import org.videoservice.mapper.video.VideoMapper;
import org.videoservice.other.enums.VideoStatus;
import org.videoservice.other.record.kafka.VideoForSearchRecord;
import org.videoservice.other.record.kafka.VideoUploadEvent;
import org.videoservice.repository.tag.TagRepository;
import org.videoservice.repository.video.VideoRepository;
import org.videoservice.service.kafka.KafkaProducerService;
import org.videoservice.service.minio.StorageService;
import org.videoservice.specification.PageableParams;
import org.videoservice.specification.video.VideoSpecification;

import java.io.InputStream;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VideoService {

    private final VideoRepository videoRepository;
    private final StorageService storageService;
    private final KafkaProducerService kafkaProducerService;
    private final VideoMapper videoMapper;
    private final TagRepository tagRepository;

    @Transactional
    public VideoInfoDtoOut upload(MultipartFile file, VideoUploadDto dto, Long userId) {
        UUID videoId = UUID.randomUUID();

        // 1. Формируем путь (ключ) для S3
        String s3Key = String.format("%s-%s", videoId, file.getOriginalFilename());

        // Поиск существующих тегов
        Set<Tag> tags = new HashSet<>();
        if (dto.getTagIds() != null && !dto.getTagIds().isEmpty()) {
            List<Tag> foundTags = tagRepository.findAllById(dto.getTagIds());
            tags.addAll(foundTags);
        }

        // 2. Сохраняем метаданные в БД
        Video video = Video.builder()
                .id(videoId)
                .title(dto.getTitle())
                .description(dto.getDescription())
                .userId(userId)
                .s3Key(s3Key)
                .tags(tags)
                .status(VideoStatus.UPLOADING)
                .build();

        videoRepository.save(video);

        // 3. Загружаем сам файл в MinIO
        storageService.uploadFile(file, s3Key);

        video.setStatus(VideoStatus.PROCESSING);

        // 4. Отправить сообщение в Kafka для обработки
        VideoUploadEvent videoUploadEvent = new VideoUploadEvent(videoId, s3Key, dto.getTitle());
        kafkaProducerService.sendUploadEvent(videoUploadEvent);

        StringBuilder stringTags = new StringBuilder();
        for (Tag tag : tags) {
            stringTags.append(tag.getDisplayName());
        }
        VideoForSearchRecord videoForSearchRecord = new VideoForSearchRecord(videoId, dto.getTitle(), dto.getDescription(), stringTags.toString());
        kafkaProducerService.sendSearchEvent(videoForSearchRecord);

        videoRepository.save(video);

        return videoMapper.toDto(video);
    }

    public Page<VideoInfoDtoOut> getVideos(PageableParams params) {
        Pageable pageable = params.toPageable(Sort.by(Sort.Direction.DESC, Video_.CREATED_AT));
        Page<Video> page = videoRepository.findByStatus(VideoStatus.READY, pageable);
        return page.map(videoMapper::toDto);
    }

    public Page<VideoInfoDtoOut> getMyVideos(PageableParams params, Long userId) {
        Pageable pageable = params.toPageable(Sort.by(Sort.Direction.DESC, Video_.CREATED_AT));
        Page<Video> page = videoRepository.findByUserId(userId, pageable);
        return page.map(videoMapper::toDto);
    }

    public ResponseEntity<Resource> getThumbnail(UUID videoId) {
        Video video = videoRepository.byId(videoId);
        InputStream is = storageService.getThumbnailInputStream(video.getId() + ".jpg");
        Resource res = new InputStreamResource(is);
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .body(res);
    }

    public VideoInfoDtoOut getVideoById(UUID id, Long userId) {
        Video video = videoRepository.byId(id);
        return videoMapper.toDtoWithLikes(video, userId);
    }

    public Page<VideoInfoDtoOut> getSubscriptionVideos(PageableParams params, Long userId) {
        Pageable pageable = params.toPageable(Sort.by(Sort.Direction.DESC, Video_.CREATED_AT));
        VideoSpecification specification = new VideoSpecification(userId);
        Page<Video> page = videoRepository.findAll(specification, pageable);
        return page.map(videoMapper::toDto);
    }

}