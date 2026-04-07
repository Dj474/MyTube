package org.recommendationsearchservice.dto.search;

import lombok.Getter;
import lombok.Setter;
import org.springframework.web.bind.annotation.GetMapping;

@Getter
@Setter
public class SearchDtoOut {

    private String id;

    private String entityType;

}
