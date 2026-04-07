package org.recommendationsearchservice.dto.search;

import lombok.Getter;
import lombok.Setter;
import org.recommendationsearchservice.dto.pageable.PageableParams;

@Getter
@Setter
public class SearchDtoIn extends PageableParams {

    private String key;

}
