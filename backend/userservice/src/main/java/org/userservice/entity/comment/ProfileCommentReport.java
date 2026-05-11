package org.userservice.entity.comment;

import jakarta.persistence.*;
import lombok.*;
import org.userservice.entity.user.User;
import org.userservice.other.enums.report.ReportReason;

import java.time.LocalDateTime;

@Entity
@Table(name = "profile_comment_reports")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ProfileCommentReport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id")
    private User reporter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comment_id")
    private ProfileComment comment;

    @Enumerated(EnumType.STRING)
    private ReportReason reason; // Используем тот же Enum, что был для юзеров

    private String status = "NEW";

    @Column
    private LocalDateTime createdAt = LocalDateTime.now();
}
