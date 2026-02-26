package org.commentservice.mapper.comment;

import org.commentservice.dto.comment.CommentDtoIn;
import org.commentservice.dto.comment.CommentDtoOut;
import org.commentservice.entity.comment.Comment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CommentMapper {

    @Mapping(target = "parentId", source = "parent.id")
    CommentDtoOut toDto(Comment comment);

    @Mapping(target = "parent", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Comment toEntity(CommentDtoIn dto, Long userId);
}
