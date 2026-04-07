package org.videoservice.other.record.kafka;

import java.util.UUID;

public record VideoForSearchRecord(UUID id, String title, String description, String tags) {
}
