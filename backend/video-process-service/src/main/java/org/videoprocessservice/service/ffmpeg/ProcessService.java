package org.videoprocessservice.service.ffmpeg;

import java.util.UUID;

public interface ProcessService {

    boolean processVideoTask(String fileKey, UUID videoId);

}
