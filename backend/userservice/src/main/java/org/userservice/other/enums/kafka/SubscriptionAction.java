package org.userservice.other.enums.kafka;

import lombok.AllArgsConstructor;

@AllArgsConstructor
public enum SubscriptionAction {
    SUBSCRIBE("subscribe"), UNSUBSCRIBE("unsubscribe");

    private String name;

}
