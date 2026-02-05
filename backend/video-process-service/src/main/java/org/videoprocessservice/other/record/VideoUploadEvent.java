package org.videoprocessservice.other.record;

import java.util.UUID;

public record VideoUploadEvent(UUID videoId, String s3Key, String title) {}

