package org.commentservice.controller.comment;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.commentservice.dto.comment.CommentDtoIn;
import org.commentservice.dto.comment.CommentDtoOut;
import org.commentservice.dto.comment.CommentUpdateDtoIn;
import org.commentservice.service.comment.CommentService;
import org.commentservice.specification.PageableParams;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @PostMapping
    public CommentDtoOut create(
            @RequestBody @Valid CommentDtoIn dto,
            @RequestHeader("X-User-Id") Long userId) {
        return commentService.create(dto, userId);
    }

    @PutMapping("/{id}")
    public CommentDtoOut update(
            @PathVariable UUID id,
            @RequestBody @Valid CommentUpdateDtoIn dto,
            @RequestHeader("X-User-Id") Long userId) {
        return commentService.update(id, dto, userId);
    }

    @DeleteMapping("/{id}")
    public void delete(
            @PathVariable UUID id,
            @RequestHeader("X-User-Id") Long userId) {
        commentService.delete(id, userId);
    }

    @GetMapping("/{videoId}")
    public Page<CommentDtoOut> getCommentsForVideo(@PathVariable UUID videoId,
                                                   @RequestHeader("X-User-Id") Long userId,
                                                   PageableParams params) {
        return commentService.getCommentsForVideo(videoId, userId, params);
    }
}
