package org.videoservice.other.record.kafka;

import java.util.UUID;

public record VideoUploadEvent(UUID videoId, String s3Key, String title) {}
