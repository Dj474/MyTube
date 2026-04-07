package org.recommendationsearchservice.entity.elastic;

import org.springframework.data.annotation.Id;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.recommendationsearchservice.other.record.user.UserRecord;
import org.recommendationsearchservice.other.record.video.VideoRecord;
import org.springframework.data.elasticsearch.annotations.DateFormat;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

import java.time.Instant;

@Document(indexName = "search_index")
@Data
@NoArgsConstructor
public class SearchIndexDoc {

    @Id
    private String id; // Это будет entity_id из внешней системы

    @Field(type = FieldType.Keyword)
    private String entityType; // VIDEO или USER

    @Field(type = FieldType.Text, analyzer = "russian")
    private String title;

    @Field(type = FieldType.Text, analyzer = "russian")
    private String content;

    @Field(type = FieldType.Text) // Теги как массив или строка
    private String tags;

    @Field(type = FieldType.Date, format = DateFormat.date_optional_time)
    private Instant createdAt = Instant.now();

    public SearchIndexDoc(VideoRecord record){
        id = record.id().toString();
        title = record.title();
        content = record.description();
        tags = record.tags();
        entityType = "VIDEO";
    };

    public SearchIndexDoc(UserRecord record) {
        id = record.id().toString();
        title = record.name();
        content = record.description();
        entityType = "USER";
    }


}
