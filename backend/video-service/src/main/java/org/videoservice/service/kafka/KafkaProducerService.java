package org.videoservice.service.kafka;

import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.videoservice.other.record.kafka.VideoUploadEvent;

@Service
@RequiredArgsConstructor
public class KafkaProducerService {

    private final KafkaTemplate<String, VideoUploadEvent> kafkaTemplate;

    public void sendUploadEvent(VideoUploadEvent videoUploadEvent) {
        kafkaTemplate.send("video-upload-topic", videoUploadEvent.videoId().toString(), videoUploadEvent);
    }

}
