package org.videoprocessservice.entity.subscription;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "subscriptions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Subscription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private UUID id;

    private Long followerId;

    private Long authorId;

    public Subscription(Long followerId, Long authorId) {
        this.followerId = followerId;
        this.authorId = authorId;
    }

}
