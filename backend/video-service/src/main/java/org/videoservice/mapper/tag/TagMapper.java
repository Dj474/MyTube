package org.videoservice.mapper.tag;

import org.mapstruct.Mapper;
import org.videoservice.dto.tag.TagDtoOut;
import org.videoservice.entity.tag.Tag;

@Mapper(componentModel = "spring")
public interface TagMapper {
    TagDtoOut toDto(Tag tag);
}
