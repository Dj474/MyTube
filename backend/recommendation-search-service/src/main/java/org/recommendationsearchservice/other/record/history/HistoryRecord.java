package org.recommendationsearchservice.other.record.history;

import java.util.UUID;

public record HistoryRecord(UUID id, Long userId, UUID videoId, String tags) {
}
