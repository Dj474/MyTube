package org.videoservice.dto.video;

import lombok.Data;
import org.videoservice.other.enums.VideoStatus;

import java.util.UUID;

@Data
public class VideoInfoDtoOut {

    private UUID id;
    private String title;
    private String description;
    private String s3Key;
    private VideoStatus status;
    private String thumbnailUrl;
    private Long userId;

}
