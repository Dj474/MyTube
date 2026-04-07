package org.recommendationsearchservice.service.search;

import lombok.RequiredArgsConstructor;
import org.recommendationsearchservice.dto.search.SearchDtoIn;
import org.recommendationsearchservice.dto.search.SearchDtoOut;
import org.recommendationsearchservice.entity.elastic.SearchIndexDoc;
import org.recommendationsearchservice.mapper.index.IndexMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.client.elc.NativeQuery;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.query.Query;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final ElasticsearchOperations elasticsearchOperations;
    private final IndexMapper indexMapper;

    public Page<SearchDtoOut> search(SearchDtoIn dto) {
        Pageable pageable = dto.toPageable();
        SearchHits<SearchIndexDoc> hits = searchWithPagination(dto.getKey(), pageable);
        List<SearchDtoOut> content = hits.getSearchHits().stream()
                .map(SearchHit::getContent)
                .map(indexMapper::toDto)
                .toList();
        return new PageImpl<>(content, pageable, hits.getTotalHits());
    }

    public SearchHits<SearchIndexDoc> searchWithPagination(String userQuery, Pageable pageable) {

        Query query = NativeQuery.builder()
                .withQuery(q -> q
                        .multiMatch(mm -> mm
                                .query(userQuery)
                                .fields("title^3", "content", "tags")
                                .fuzziness("AUTO")
                        )
                )
                .withPageable(pageable)
                .build();

        return elasticsearchOperations.search(query, SearchIndexDoc.class);
    }

}
