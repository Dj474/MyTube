package org.recommendationsearchservice.service.recommendation;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.recommendationsearchservice.dto.pageable.PageableParams;
import org.recommendationsearchservice.dto.recommendation.RecommendationDtoOut;
import org.recommendationsearchservice.entity.elastic.SearchIndexDoc;
import org.recommendationsearchservice.entity.history.HistoryDoc;
import org.springframework.data.domain.*;
import org.springframework.data.elasticsearch.client.elc.NativeQuery;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.query.Query;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecommendationService {

    private final ElasticsearchOperations elasticsearchOperations;

    public List<SearchIndexDoc> getRecommendations(Long userId, Pageable pageable) {
        // ШАГ 1: Получаем теги из последних 5 просмотров пользователя
        List<String> lastTags = getUserLastTags(userId);

        if (lastTags.isEmpty()) {
            log.info("История пуста, возвращаем пустой список или популярное");
            return List.of();
        }

        // Превращаем список тегов в одну строку для поиска
        String searchKeywords = String.join(" ", lastTags);

        // ШАГ 2: Ищем похожие видео в основном индексе
        // Используем match_phrase_prefix или multiMatch для гибкости
        Query query = NativeQuery.builder()
                .withQuery(q -> q.bool(b -> b
                        .must(m -> m.multiMatch(mm -> mm
                                .query(searchKeywords)
                                .fields("tags^3", "title^2", "content")
                        ))
                        // Исключаем из рекомендаций те видео, которые уже в истории (опционально)
                        .filter(f -> f.term(t -> t.field("entityType").value("VIDEO")))
                ))
                .withPageable(pageable)
                .build();

        return elasticsearchOperations.search(query, SearchIndexDoc.class)
                .map(SearchHit::getContent)
                .toList();
    }

    private List<String> getUserLastTags(Long userId) {
        Query query = NativeQuery.builder()
                .withQuery(q -> q.term(t -> t.field("userId").value(userId)))
                .withPageable(PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "viewedAt")))
                .build();

        SearchHits<HistoryDoc> historyHits = elasticsearchOperations.search(query, HistoryDoc.class);

        return historyHits.getSearchHits().stream()
                .map(hit -> hit.getContent().getTags())
                .filter(Objects::nonNull)
                .toList();
    }

    public Page<RecommendationDtoOut> getRecommendations(Long userId, PageableParams params) {
        // 1. Преобразуем параметры в объект пагинации Spring
        Pageable pageable = params.toPageable();

        // 2. Получаем теги из истории (используем уже готовый приватный метод)
        List<String> lastTags = getUserLastTags(userId);

        // Если истории нет — возвращаем пустую страницу
        if (lastTags.isEmpty()) {
            return Page.empty(pageable);
        }

        String searchKeywords = String.join(" ", lastTags);

        // 3. Строим запрос к Elasticsearch
        // Добавляем .withPageable(pageable), чтобы Elastic вернул нужный кусок данных (from/size)
        Query query = NativeQuery.builder()
                .withQuery(q -> q.bool(b -> b
                        .must(m -> m.multiMatch(mm -> mm
                                .query(searchKeywords)
                                .fields("tags^3", "title^2", "content")
                        ))
                        .filter(f -> f.term(t -> t.field("entityType").value("VIDEO")))
                ))
                .withPageable(pageable)
                .build();

        // 4. Выполняем поиск
        SearchHits<SearchIndexDoc> hits = elasticsearchOperations.search(query, SearchIndexDoc.class);

        // 5. Маппим результаты из SearchIndexDoc в RecommendationDtoOut
        // Здесь предполагается наличие конструктора или маппера
        List<RecommendationDtoOut> content = hits.getSearchHits().stream()
                .map(hit -> {
                    SearchIndexDoc doc = hit.getContent();
                    return new RecommendationDtoOut(
                            UUID.fromString(doc.getId())
                    );
                })
                .toList();

        // 6. Возвращаем страницу, передавая контент, объект пагинации и общее кол-во найденных элементов
        return new PageImpl<>(content, pageable, hits.getTotalHits());
    }

}
