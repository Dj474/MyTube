package org.videoservice.mapper.video;

import org.mapstruct.Mapper;
import org.videoservice.dto.video.VideoInfoDtoOut;
import org.videoservice.entity.video.Video;

@Mapper(componentModel = "spring")
public interface VideoMapper {

    VideoInfoDtoOut toDto(Video video);

}
