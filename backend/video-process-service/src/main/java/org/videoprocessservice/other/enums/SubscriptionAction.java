package org.videoprocessservice.other.enums;

import lombok.AllArgsConstructor;

@AllArgsConstructor
public enum SubscriptionAction {
    SUBSCRIBE("subscribe"), UNSUBSCRIBE("unsubscribe");

    private String name;

}
