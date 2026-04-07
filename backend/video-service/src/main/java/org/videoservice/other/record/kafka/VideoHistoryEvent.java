package org.videoservice.other.record.kafka;

import java.util.UUID;

public record VideoHistoryEvent(UUID id, Long userId, UUID videoId, String tags) {
}
