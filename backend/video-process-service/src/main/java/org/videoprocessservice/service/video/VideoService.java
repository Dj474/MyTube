package org.videoprocessservice.service.video;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.videoprocessservice.entity.video.Video;
import org.videoprocessservice.other.enums.VideoStatus;
import org.videoprocessservice.service.ffmpeg.ProcessService;
import org.videoprocessservice.service.minio.StorageService;
import org.videoprocessservice.video.VideoRepository;

import java.util.UUID;

@Service
public class VideoService {

    private final VideoRepository videoRepository;
    private final StorageService storageService;
    private final ProcessService processService;

    public VideoService(VideoRepository videoRepository,
                        StorageService storageService,
                        @Qualifier("processServiceHlsImpl") ProcessService processService) {
        this.videoRepository = videoRepository;
        this.storageService = storageService;
        this.processService = processService;
    }

    @Transactional
    public void processVideo(UUID videoId) {
        Video video = videoRepository.findById(videoId).orElse(null);
        if (video == null) {
            return;
        }
        video.setStatus(VideoStatus.PROCESSING);
        videoRepository.save(video);

        if (!processService.processVideoTask(video.getS3Key(), video.getId())) {
            storageService.deleteOutput(video.getId().toString());
            video.setStatus(VideoStatus.ERROR);
        }
        else {
            storageService.deleteInput(video.getS3Key());
            video.setStatus(VideoStatus.READY);
            video.setS3Key(video.getId().toString());
        }
        videoRepository.save(video);
    }
}
