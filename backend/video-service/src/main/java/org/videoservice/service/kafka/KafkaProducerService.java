package org.videoservice.service.kafka;

import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.videoservice.other.record.kafka.VideoForSearchRecord;
import org.videoservice.other.record.kafka.VideoUploadEvent;

@Service
@RequiredArgsConstructor
public class KafkaProducerService {

    private final KafkaTemplate<String, VideoUploadEvent> kafkaTemplate;
    private final KafkaTemplate<String, VideoForSearchRecord> kafkaForSearchTemplate;

    public void sendUploadEvent(VideoUploadEvent videoUploadEvent) {
        kafkaTemplate.send("video-upload-topic", videoUploadEvent.videoId().toString(), videoUploadEvent);
    }

    public void sendSearchEvent(VideoForSearchRecord videoForSearchRecord) {
        kafkaForSearchTemplate.send("video-recomend-topic", videoForSearchRecord.id().toString(), videoForSearchRecord);
    }

}
