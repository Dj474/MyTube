package org.recommendationsearchservice.mapper.index;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.recommendationsearchservice.dto.search.SearchDtoOut;
import org.recommendationsearchservice.entity.elastic.SearchIndexDoc;

@Mapper(componentModel = "spring")
public interface IndexMapper {

    SearchDtoOut toDto(SearchIndexDoc doc);
}
