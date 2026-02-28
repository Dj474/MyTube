package org.commentservice.dto.comment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentUpdateDtoIn {

    @NotBlank(message = "Content cannot be empty")
    @Size(max = 2000, message = "Comment is too long")
    private String content;
}
