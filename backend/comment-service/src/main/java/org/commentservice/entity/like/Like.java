package org.commentservice.entity.like;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.commentservice.entity.comment.Comment;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "likes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Like {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private UUID id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne()
    @JoinColumn(name = "comment_id")
    private Comment comment;

    public Like(Long userId, Comment comment) {
        this.userId = userId;
        this.comment = comment;
    }

}
