package org.userservice.other.record.kafka;

import org.userservice.other.enums.kafka.SubscriptionAction;

public record UserSubscriptionEvent(Long followerId, Long authorId, SubscriptionAction action) {
}
