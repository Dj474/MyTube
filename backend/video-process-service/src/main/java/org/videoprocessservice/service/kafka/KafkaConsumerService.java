package org.videoprocessservice.service.kafka;

import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.videoprocessservice.other.record.VideoUploadEvent;

@RequiredArgsConstructor
@Service
public class KafkaConsumerService {


    @KafkaListener(topics = "video-upload-topic", groupId = "video-processor-group")
    public void onVideoUpload(VideoUploadEvent event) {
        System.out.println("Получено видео для обработки: " + event.title());
        // Тут пойдет логика скачивания из S3 и FFmpeg
    }



}
