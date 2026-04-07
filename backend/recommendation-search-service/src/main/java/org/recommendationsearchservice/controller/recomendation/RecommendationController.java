package org.recommendationsearchservice.controller.recomendation;

import lombok.RequiredArgsConstructor;
import org.recommendationsearchservice.dto.pageable.PageableParams;
import org.recommendationsearchservice.dto.recommendation.RecommendationDtoOut;
import org.recommendationsearchservice.service.recommendation.RecommendationService;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/v1/recommendation")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    @GetMapping
    public Page<RecommendationDtoOut> getRecommendations(PageableParams params, @RequestHeader("X-User-Id") Long userId) {
        return recommendationService.getRecommendations(userId, params);
    }


}
