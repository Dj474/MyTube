package org.videoservice.entity.video;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.videoservice.other.enums.VideoStatus;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "videos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Video {

    @Id
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "s3_key", nullable = false, length = 512)
    private String s3Key;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private VideoStatus status = VideoStatus.UPLOADING;

    @Column(name = "thumbnail_url", length = 512)
    private String thumbnailUrl;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}