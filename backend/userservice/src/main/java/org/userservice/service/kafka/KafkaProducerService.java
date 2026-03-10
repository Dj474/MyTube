package org.userservice.service.kafka;

import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.userservice.other.record.kafka.UserForSearchRecord;
import org.userservice.other.record.kafka.UserSubscriptionEvent;

@Service
@RequiredArgsConstructor
public class KafkaProducerService {

    private final KafkaTemplate<String, UserSubscriptionEvent> kafkaTemplate;
    private final KafkaTemplate<String, UserForSearchRecord> kafkaForSearchTemplate;

    public void sendUploadEvent(UserSubscriptionEvent event) {
        kafkaTemplate.send("user-subscription-topic", event);
    }

    public void sendSearchEvent(UserForSearchRecord event) {
        kafkaForSearchTemplate.send("user-recomend-topic", event);
    }

}
