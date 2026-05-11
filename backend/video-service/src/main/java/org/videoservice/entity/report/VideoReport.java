package org.videoservice.entity.report;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.videoservice.other.enums.VideoReportReason;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "video_reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VideoReport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "video_id", nullable = false)
    private UUID videoId;

    @Column(name = "reporter_id", nullable = false)
    private Long reporterId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VideoReportReason reason;

    private String description;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
