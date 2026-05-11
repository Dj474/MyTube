package org.userservice.dto.comment;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ProfileCommentDto {
    private Long id;
    private Long authorId;
    private String authorNickname;
    private String content;
    private LocalDateTime createdAt;
    private long likesCount;
    private boolean isLiked; // Лайкнул ли текущий зритель
}