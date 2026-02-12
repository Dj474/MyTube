package org.videoservice.mapper.video;

import org.mapstruct.Mapper;
import org.springframework.stereotype.Component;
import org.videoservice.dto.video.VideoInfoDtoOut;
import org.videoservice.entity.video.Video;

@Mapper()
@Component
public interface VideoMapper {

    VideoInfoDtoOut toDto(Video video);

}
