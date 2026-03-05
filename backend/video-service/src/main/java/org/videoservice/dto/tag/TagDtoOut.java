package org.videoservice.dto.tag;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TagDtoOut {
    private Long id;
    private String name;
    private String displayName;
}