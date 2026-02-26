package org.commentservice.dto.comment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentDtoIn {

    @NotNull(message = "Video ID cannot be null")
    private UUID videoId;

    @NotBlank(message = "Content cannot be empty")
    @Size(max = 2000, message = "Comment is too long")
    private String content;

    private UUID parentId;
}
