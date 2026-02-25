package org.videoprocessservice.other.record;

import org.videoprocessservice.other.enums.SubscriptionAction;

public record UserSubscriptionEvent(Long followerId, Long authorId, SubscriptionAction action) {
}
