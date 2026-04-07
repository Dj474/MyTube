package org.recommendationsearchservice.controller;

import lombok.RequiredArgsConstructor;
import org.recommendationsearchservice.dto.search.SearchDtoIn;
import org.recommendationsearchservice.dto.search.SearchDtoOut;
import org.recommendationsearchservice.service.search.SearchService;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/v1/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @GetMapping
    public Page<SearchDtoOut> search(SearchDtoIn dto) {
        return searchService.search(dto);
    }



}
