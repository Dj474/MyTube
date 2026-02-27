package org.commentservice.controller.like;

import lombok.RequiredArgsConstructor;
import org.commentservice.service.like.LikeService;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/comment/like")
@RequiredArgsConstructor
public class LikeController {

    private final LikeService likeService;

    @PostMapping("/{commentId}")
    public void createLike(@RequestHeader("X-User-Id") Long userId,
                           @PathVariable UUID commentId) {
        likeService.createLike(userId, commentId);
    }

    @DeleteMapping("/{commentId}")
    public void deleteLike(@RequestHeader("X-User-Id") Long userId,
                           @PathVariable UUID commentId) {
        likeService.deleteLike(userId, commentId);
    }

}
