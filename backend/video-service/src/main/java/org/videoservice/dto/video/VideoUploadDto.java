package org.videoservice.dto.video;

import lombok.Data;

import java.util.List;

@Data
public class VideoUploadDto {

    private String title;
    private String description;
    private List<Long> tagIds;

}
