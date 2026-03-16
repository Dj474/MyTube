package org.recommendationsearchservice.service.search;

import lombok.RequiredArgsConstructor;
import org.recommendationsearchservice.dto.search.SearchDtoIn;
import org.recommendationsearchservice.entity.elastic.SearchIndexDoc;
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

    public List<SearchIndexDoc> search(SearchDtoIn dto) {
        Pageable pageable = dto.toPageable();
        SearchHits<SearchIndexDoc> hits = searchWithPagination(dto.getKey(), pageable);
        return hits.getSearchHits().stream()
                .map(SearchHit::getContent)
                .toList();
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
                .build();

        return elasticsearchOperations.search(query, SearchIndexDoc.class);
    }

}
