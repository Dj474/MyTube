package org.recommendationsearchservice.repository;

import org.recommendationsearchservice.entity.elastic.SearchIndexDoc;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SearchRepository extends ElasticsearchRepository<SearchIndexDoc, String> {
    // Здесь можно будет добавить кастомные методы поиска
}