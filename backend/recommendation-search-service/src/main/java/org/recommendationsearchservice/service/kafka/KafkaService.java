package org.recommendationsearchservice.service.kafka;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.recommendationsearchservice.other.record.user.UserRecord;
import org.recommendationsearchservice.other.record.video.VideoRecord;
import org.recommendationsearchservice.service.elastic.IndexingService;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class KafkaService {

    private final IndexingService indexingService;

    @KafkaListener(containerFactory = "kafkaListenerContainerVideoFactory", topics = "video-recomend-topic", groupId = "recom-group")
    public void processVideo(VideoRecord record) {
        log.info("message in video-recomend");
        indexingService.createVideoEntity(record);
    }

    @KafkaListener(containerFactory = "kafkaListenerContainerUserFactory", topics = "user-recomend-topic", groupId = "recom-group")
    public void processUser(UserRecord record) {
        log.info("message in user-recomend");
        indexingService.createUserEntity(record);
    }

}
