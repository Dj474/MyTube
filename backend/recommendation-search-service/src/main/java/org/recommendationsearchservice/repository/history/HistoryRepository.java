package org.recommendationsearchservice.repository.history;

import org.recommendationsearchservice.entity.history.HistoryDoc;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface HistoryRepository extends ElasticsearchRepository<HistoryDoc, UUID> {
}
