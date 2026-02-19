package org.videoprocessservice.service.ffmpeg;

import java.util.Map;
import java.util.UUID;

public interface ProcessService {

    Map<String, String> processVideoTask(String fileKey, UUID videoId);

}
