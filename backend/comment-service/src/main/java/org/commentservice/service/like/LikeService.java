package org.commentservice.service.like;

import lombok.RequiredArgsConstructor;
import org.commentservice.entity.comment.Comment;
import org.commentservice.entity.like.Like;
import org.commentservice.exception.BadRequestException;
import org.commentservice.repository.comment.CommentRepository;
import org.commentservice.repository.like.LikeRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LikeService {

    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;

    public void createLike(Long userId, UUID commentId) {
        Comment comment = commentRepository.byId(commentId);
        if (likeRepository.existsByUserIdAndComment(userId, comment)) {
            throw new BadRequestException("comment already liked");
        }
        Like like = new Like(userId, comment);
        likeRepository.save(like);
    }

    public void deleteLike(Long userId, UUID commentId) {
        Comment comment = commentRepository.byId(commentId);
        if (!likeRepository.existsByUserIdAndComment(userId, comment)) {
            throw new BadRequestException("comment already liked");
        }
        Like like = new Like(userId, comment);
        likeRepository.delete(like);
    }

}
