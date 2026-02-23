package org.userservice.repository.subscription;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.userservice.entity.subscription.Subscription;
import org.userservice.entity.user.User;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {

    Optional<Subscription> findByFollowerAndAuthor(User follower, User author);

    boolean existsByFollowerAndAuthor(User follower, User author);

    Page<Subscription> findByFollower(User user, Pageable pageable);

}
