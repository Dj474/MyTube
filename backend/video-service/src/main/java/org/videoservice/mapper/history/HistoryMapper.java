package org.videoservice.mapper.history;

import org.mapstruct.Mapper;
import org.videoservice.dto.history.HistoryDtoOut;
import org.videoservice.entity.history.History;

@Mapper(componentModel = "spring")
public interface HistoryMapper {

    HistoryDtoOut toDto(History history);

}
