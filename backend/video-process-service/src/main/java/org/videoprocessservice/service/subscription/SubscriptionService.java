package org.videoprocessservice.service.subscription;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.videoprocessservice.entity.subscription.Subscription;
import org.videoprocessservice.other.enums.SubscriptionAction;
import org.videoprocessservice.other.record.UserSubscriptionEvent;
import org.videoprocessservice.repository.subscription.SubscriptionRepository;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;

    public void processSubscriptionEvent(UserSubscriptionEvent event) {
        if (event.action().equals(SubscriptionAction.SUBSCRIBE))
            createSubscription(event.followerId(), event.authorId());
        else
            deleteSubscription(event.followerId(), event.authorId());
    }

    private void createSubscription(Long followerId, Long authorId) {
        if (subscriptionRepository.existsByFollowerIdAndAuthorId(followerId, authorId)) return;
        Subscription subscription = new Subscription(followerId, authorId);
        subscriptionRepository.save(subscription);
    }

    private void deleteSubscription(Long followerId, Long authorId) {
        Subscription subscription = subscriptionRepository.findByFollowerIdAndAuthorId(followerId, authorId).orElse(null);
        if(subscription == null) return;
        subscriptionRepository.delete(subscription);

    }

}
