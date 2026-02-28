package org.videoservice.controller.like;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.videoservice.service.like.LikeService;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/comment/like")
@RequiredArgsConstructor
public class LikeController {

    private final LikeService likeService;

    @PostMapping("/{videoId}")
    public void createLike(@RequestHeader("X-User-Id") Long userId,
                           @PathVariable UUID videoId) {
        likeService.createLike(userId, videoId);
    }

    @DeleteMapping("/{videoId}")
    public void deleteLike(@RequestHeader("X-User-Id") Long userId,
                           @PathVariable UUID videoId) {
        likeService.deleteLike(userId, videoId);
    }

}
