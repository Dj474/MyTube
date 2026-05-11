package org.videoservice.mapper.history;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.videoservice.dto.history.HistoryDtoOut;
import org.videoservice.entity.history.History;

@Mapper(componentModel = "spring")
public interface HistoryMapper {

    @Mapping(target = "videoId", source = "history.video.id")
    HistoryDtoOut toDto(History history);

}
