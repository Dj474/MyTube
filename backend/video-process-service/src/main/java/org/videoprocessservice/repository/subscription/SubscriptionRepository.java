package org.videoprocessservice.repository.subscription;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.videoprocessservice.entity.subscription.Subscription;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {

    boolean existsByFollowerIdAndAuthorId(Long followerId, Long authorId);

    Optional<Subscription> findByFollowerIdAndAuthorId(Long followerId, Long authorId);
}
