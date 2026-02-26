package org.commentservice.service.comment;

import lombok.RequiredArgsConstructor;
import org.commentservice.dto.comment.CommentDtoIn;
import org.commentservice.dto.comment.CommentDtoOut;
import org.commentservice.dto.comment.CommentUpdateDtoIn;
import org.commentservice.entity.comment.Comment;
import org.commentservice.exception.ForbiddenException;
import org.commentservice.exception.NotFoundException;
import org.commentservice.mapper.comment.CommentMapper;
import org.commentservice.repository.comment.CommentRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final CommentMapper commentMapper;

    public CommentDtoOut create(CommentDtoIn dto, Long userId) {
        Comment comment = commentMapper.toEntity(dto, userId);

        if (dto.getParentId() != null) {
            Comment parent = commentRepository.byId(dto.getParentId());
            comment.setParent(parent);
        }

        return commentMapper.toDto(commentRepository.save(comment));
    }

    public CommentDtoOut update(UUID id, CommentUpdateDtoIn dto, Long userId) {
        Comment comment = commentRepository.byId(id);

        if (!comment.getUserId().equals(userId)) {
            throw new ForbiddenException("You can only edit your own comments");
        }

        comment.setContent(dto.getContent());
        return commentMapper.toDto(commentRepository.save(comment));
    }

    public void delete(UUID id, Long userId) {
        Comment comment = commentRepository.byId(id);

        if (!comment.getUserId().equals(userId)) {
            throw new ForbiddenException("You can only delete your own comments");
        }

        commentRepository.delete(comment);
    }
}
