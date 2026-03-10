package org.recommendationsearchservice.other.record.video;

import java.util.UUID;

public record VideoRecord(UUID id, String title, String description, String tags) {
}
