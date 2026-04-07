package org.recommendationsearchservice.dto.recommendation;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
public class RecommendationDtoOut {

    private UUID videoId;
}
