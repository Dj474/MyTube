package org.videoprocessservice.config;

import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.support.serializer.JsonDeserializer;
import org.videoprocessservice.other.record.UserSubscriptionEvent;
import org.videoprocessservice.other.record.VideoUploadEvent;

import java.util.HashMap;
import java.util.Map;

@EnableKafka
@Configuration
public class KafkaConsumerConfig {

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    @Bean
    public ConsumerFactory<String, VideoUploadEvent> consumerFactory() {
        Map<String, Object> props = new HashMap<>();

        // 1. Базовое подключение
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, "video-processor-group");

        // 2. Десериализаторы (КЛАССЫ)
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, JsonDeserializer.class);

        // 3. Настройки JSON (строго через свойства, чтобы избежать deprecated конструкторов)

        // Указываем в какой класс превращать JSON (полное имя класса)
        props.put(JsonDeserializer.VALUE_DEFAULT_TYPE, VideoUploadEvent.class);

        // Доверяем всем пакетам при десериализации
        props.put(JsonDeserializer.TRUSTED_PACKAGES, "*");

        // Игнорируем заголовки типов от отправителя (важно, если в сервисах разные имена пакетов)
        props.put(JsonDeserializer.USE_TYPE_INFO_HEADERS, false);

        return new DefaultKafkaConsumerFactory<>(props);
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, VideoUploadEvent> kafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, VideoUploadEvent> factory =
                new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactory());

        // Можно настроить количество потоков обработки (например, 3 видео параллельно)
        // factory.setConcurrency(3);

        return factory;
    }

    @Bean
    public ConsumerFactory<String, UserSubscriptionEvent> consumerSubscriptionFactory() {
        Map<String, Object> props = new HashMap<>();

        // 1. Базовое подключение
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, "video-processor-group");

        // 2. Десериализаторы (КЛАССЫ)
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, JsonDeserializer.class);

        // 3. Настройки JSON (строго через свойства, чтобы избежать deprecated конструкторов)

        // Указываем в какой класс превращать JSON (полное имя класса)
        props.put(JsonDeserializer.VALUE_DEFAULT_TYPE, UserSubscriptionEvent.class);

        // Доверяем всем пакетам при десериализации
        props.put(JsonDeserializer.TRUSTED_PACKAGES, "*");

        // Игнорируем заголовки типов от отправителя (важно, если в сервисах разные имена пакетов)
        props.put(JsonDeserializer.USE_TYPE_INFO_HEADERS, false);

        return new DefaultKafkaConsumerFactory<>(props);
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, UserSubscriptionEvent> kafkaListenerSubscriptionContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, UserSubscriptionEvent> factory =
                new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerSubscriptionFactory());

        // Можно настроить количество потоков обработки (например, 3 видео параллельно)
        // factory.setConcurrency(3);

        return factory;
    }
}