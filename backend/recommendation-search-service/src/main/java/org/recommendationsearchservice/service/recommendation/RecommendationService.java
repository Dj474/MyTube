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

import java.util.ArrayList;
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
        Pageable pageable = params.toPageable();
        int targetSize = pageable.getPageSize();

        List<String> lastTags = getUserLastTags(userId);
        List<RecommendationDtoOut> combinedContent = new ArrayList<>();
        long totalHits = 0;

        // 1. Пытаемся найти релевантные видео по тегам
        if (!lastTags.isEmpty()) {
            String searchKeywords = String.join(" ", lastTags);
            Query relevantQuery = NativeQuery.builder()
                    .withQuery(q -> q.bool(b -> b
                            .must(m -> m.multiMatch(mm -> mm
                                    .query(searchKeywords)
                                    .fields("tags^3", "title^2", "content")
                            ))
                            .filter(f -> f.term(t -> t.field("entityType").value("VIDEO")))
                    ))
                    .withPageable(pageable)
                    .build();

            SearchHits<SearchIndexDoc> relevantHits = elasticsearchOperations.search(relevantQuery, SearchIndexDoc.class);
            totalHits = relevantHits.getTotalHits();

            relevantHits.getSearchHits().forEach(hit ->
                    combinedContent.add(new RecommendationDtoOut(UUID.fromString(hit.getContent().getId())))
            );
        }

        // 2. Если результатов меньше, чем запрошенный size, "добиваем" случайными
        if (combinedContent.size() < targetSize) {
            int needMore = targetSize - combinedContent.size();

            // Собираем ID уже найденных видео, чтобы не дублировать их
            List<String> excludeIds = combinedContent.stream()
                    .map(dto -> dto.getVideoId().toString())
                    .toList();

            Query randomQuery = NativeQuery.builder()
                    .withQuery(q -> q.functionScore(fs -> fs
                            .query(query -> query.bool(b -> b
                                    .filter(f -> f.term(t -> t.field("entityType").value("VIDEO")))
                                    .mustNot(m -> m.ids(ids -> ids.values(excludeIds))) // Исключаем уже найденные
                            ))
                            .functions(f -> f.randomScore(rs -> rs)) // Примешиваем случайность
                    ))
                    .withPageable(PageRequest.of(0, needMore)) // Берем только столько, сколько не хватает
                    .build();

            SearchHits<SearchIndexDoc> randomHits = elasticsearchOperations.search(randomQuery, SearchIndexDoc.class);

            randomHits.getSearchHits().forEach(hit ->
                    combinedContent.add(new RecommendationDtoOut(UUID.fromString(hit.getContent().getId())))
            );

            // Обновляем общее количество (виртуально), чтобы пагинация не ломалась сразу
            if (totalHits < combinedContent.size()) {
                totalHits = combinedContent.size();
            }
        }

        return new PageImpl<>(combinedContent, pageable, totalHits);
    }

}
