package org.recommendationsearchservice.controller;

import lombok.RequiredArgsConstructor;
import org.recommendationsearchservice.dto.search.SearchDtoIn;
import org.recommendationsearchservice.dto.search.SearchDtoOut;
import org.recommendationsearchservice.entity.elastic.SearchIndexDoc;
import org.recommendationsearchservice.service.search.SearchService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @GetMapping
    public List<SearchIndexDoc> search(SearchDtoIn dto) {
        return searchService.search(dto);
    }

}
