package org.recommendationsearchservice.entity.history;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.recommendationsearchservice.other.record.history.HistoryRecord;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.DateFormat;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

import java.time.Instant;
import java.util.UUID;

@Document(indexName = "user_history")
@Data
@NoArgsConstructor
public class HistoryDoc {
    @Id
    private UUID id;

    @Field(type = FieldType.Long)
    private Long userId;

    @Field(type = FieldType.Long)
    private UUID videoId;

    @Field(type = FieldType.Text)
    private String tags;

    @Field(type = FieldType.Date, format = DateFormat.date_optional_time)
    private Instant viewedAt = Instant.now();

    public HistoryDoc(HistoryRecord record) {
        this.id = record.id();
        this.userId = record.userId();
        this.videoId = record.videoId();
        this.tags = record.tags();
    }

}
