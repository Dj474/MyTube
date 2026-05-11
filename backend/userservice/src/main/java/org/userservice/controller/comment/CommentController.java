package org.userservice.controller.comment;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;
import org.userservice.dto.comment.ProfileCommentDto;
import org.userservice.service.comment.ProfileInteractionService;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/profile/comment")
@RequiredArgsConstructor
public class CommentController {
    private final ProfileInteractionService interactionService;

    // Оставить комментарий в профиле
    @PostMapping("/{profileId}/comments")
    public void postComment(@PathVariable Long profileId,
                            @RequestBody Map<String, String> body) {
        interactionService.addComment(profileId, body.get("content"));
    }

    // Лайкнуть комментарий
    @PostMapping("/comments/{commentId}/like")
    public void likeComment(@PathVariable Long commentId) {
        interactionService.toggleLike(commentId);
    }

    // Пожаловаться на комментарий
    @PostMapping("/comments/{commentId}/report")
    public void reportComment(@PathVariable Long commentId,
                              @RequestBody Map<String, String> body) {
        interactionService.reportComment(commentId, body.get("reason"));
    }

    @GetMapping("/{profileId}/comments")
    public Page<ProfileCommentDto> getComments(@PathVariable Long profileId,
                                               @RequestParam(defaultValue = "0") int page,
                                               @RequestParam(defaultValue = "10") int size) {
        return interactionService.getComments(profileId, PageRequest.of(page, size));
    }
}
