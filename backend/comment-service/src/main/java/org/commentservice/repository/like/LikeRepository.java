package org.commentservice.repository.like;

import org.commentservice.entity.comment.Comment;
import org.commentservice.entity.like.Like;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface LikeRepository extends JpaRepository<Like, UUID> {

    Boolean existsByUserIdAndComment(Long userId, Comment comment);

    Long countByComment(Comment comment);

}
