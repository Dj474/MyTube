package org.userservice.service.subscription;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.userservice.dto.subscription.SubscriptionDtoOut;
import org.userservice.entity.subscription.Subscription;
import org.userservice.entity.user.User;
import org.userservice.exception.NotFoundException;
import org.userservice.mapper.subscription.SubscriptionMapper;
import org.userservice.other.enums.kafka.SubscriptionAction;
import org.userservice.other.record.kafka.UserSubscriptionEvent;
import org.userservice.repository.subscription.SubscriptionRepository;
import org.userservice.repository.user.UserRepository;
import org.userservice.service.kafka.KafkaProducerService;
import org.userservice.service.user.UserService;
import org.userservice.specification.PageableParams;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final UserService userService;
    private final UserRepository userRepository;
    private final SubscriptionMapper subscriptionMapper;
    private final KafkaProducerService kafkaProducerService;

    public void subscribe(Long authorId) {
        User current = userService.getCurrent();

        User author = userRepository.byId(authorId);

        Subscription subscription = new Subscription();
        subscription.setFollower(current);
        subscription.setAuthor(author);
        subscriptionRepository.save(subscription);
        kafkaProducerService.sendUploadEvent(new UserSubscriptionEvent(current.getId(), author.getId(), SubscriptionAction.SUBSCRIBE));

    }

    public void unsubscribe(Long authorId) {
        User current = userService.getCurrent();

        User author = userRepository.byId(authorId);

        Subscription subscription = subscriptionRepository.findByFollowerAndAuthor(current, author)
                .orElseThrow(() -> new NotFoundException("subscription not found"));

        subscriptionRepository.delete(subscription);

        kafkaProducerService.sendUploadEvent(new UserSubscriptionEvent(current.getId(), author.getId(), SubscriptionAction.UNSUBSCRIBE));
    }

    public Page<SubscriptionDtoOut> getSubscriptions(PageableParams params) {
        User current = userService.getCurrent();

        Pageable pageable = params.toPageable();
        Page<Subscription> page = subscriptionRepository.findByFollower(current, pageable);
        return page.map(subscriptionMapper::toDto);
    }

}
