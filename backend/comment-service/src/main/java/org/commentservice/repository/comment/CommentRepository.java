package org.commentservice.repository.comment;

import org.commentservice.entity.comment.Comment;
import org.commentservice.exception.NotFoundException;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CommentRepository extends JpaRepository<Comment, UUID> {

    default Comment byId(UUID id) {
        return findById(id)
                .orElseThrow(() -> new NotFoundException("Comment with id " + id + "not found"));
    }

}
