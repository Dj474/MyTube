package org.videoservice.config;

import org.springframework.kafka.support.serializer.JsonSerializer;
import org.apache.kafka.common.serialization.StringSerializer;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.videoservice.other.record.kafka.VideoForSearchRecord;
import org.videoservice.other.record.kafka.VideoHistoryEvent;
import org.videoservice.other.record.kafka.VideoUploadEvent;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class KafkaProducerConfig {

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    private Map<String, Object> getProducerConfig() {
        Map<String, Object> configProps = new HashMap<>();
        configProps.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        // Ключ будет строкой (UUID видео)
        configProps.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        // Значение — наш Record, превращенный в JSON
        configProps.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);
        return configProps;
    }

    @Bean
    public KafkaTemplate<String, VideoUploadEvent> kafkaTemplate() {
        return new KafkaTemplate<>(new DefaultKafkaProducerFactory<>(getProducerConfig()));
    }

    @Bean
    public KafkaTemplate<String, VideoForSearchRecord> kafkaForSearchTemplate() {
        return new KafkaTemplate<>(new DefaultKafkaProducerFactory<>(getProducerConfig()));
    }

    @Bean
    public KafkaTemplate<String, VideoHistoryEvent> kafkaForHistoryTemplate() {
        return new KafkaTemplate<>(new DefaultKafkaProducerFactory<>(getProducerConfig()));
    }

}
