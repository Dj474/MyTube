package org.commentservice.mapper.comment;

import org.commentservice.dto.comment.CommentDtoIn;
import org.commentservice.dto.comment.CommentDtoOut;
import org.commentservice.entity.comment.Comment;
import org.commentservice.repository.like.LikeRepository;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper(componentModel = "spring")
public abstract class CommentMapper {

    @Autowired
    protected LikeRepository likeRepository;

    @Mapping(target = "parentId", source = "parent.id")
    public abstract CommentDtoOut toDto(Comment comment);

    @Mapping(target = "parent", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    public abstract Comment toEntity(CommentDtoIn dto, Long userId);

    @Mapping(target = "parentId", source = "comment.parent.id")
    @Mapping(target = "isLiked", expression = "java(isLiked(comment, userId))")
    @Mapping(target = "amountOfLikes", expression = "java(getAmountOfLikes(comment))")
    public abstract CommentDtoOut toDtoWithLikes(Comment comment, Long userId);

    protected Boolean isLiked(Comment comment, Long userId) {
        return likeRepository.existsByUserIdAndComment(userId, comment);
    }

    protected Long getAmountOfLikes(Comment comment) {
        return likeRepository.countByComment(comment);
    }

}
