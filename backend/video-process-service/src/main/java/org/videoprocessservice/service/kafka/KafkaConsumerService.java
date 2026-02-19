package org.videoprocessservice.service.kafka;

import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.videoprocessservice.other.record.VideoUploadEvent;
import org.videoprocessservice.service.video.VideoService;

@RequiredArgsConstructor
@Service
public class KafkaConsumerService {

    private final VideoService videoService;

    @KafkaListener(topics = "video-upload-topic", groupId = "video-processor-group")
    public void onVideoUpload(VideoUploadEvent event) {
        System.out.println("Получено видео для обработки: " + event.title());
        videoService.processVideo(event.videoId());
    }



}
