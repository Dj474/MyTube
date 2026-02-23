package org.videoservice.specification.video;

import jakarta.persistence.criteria.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.videoservice.entity.subscription.Subscription;
import org.videoservice.entity.subscription.Subscription_;
import org.videoservice.entity.video.Video;
import org.videoservice.entity.video.Video_;
import org.videoservice.other.enums.VideoStatus;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.stream.Stream;

@RequiredArgsConstructor
public class VideoSpecification implements Specification<Video> {

    private final Long followerId;

    private Root<Video> root;
    private CriteriaQuery<?> query;
    private CriteriaBuilder cb;

    @Override
    public Predicate toPredicate(Root<Video> root, CriteriaQuery<?> query, CriteriaBuilder criteriaBuilder) {

        this.root = root;
        this.query = query;
        this.cb = criteriaBuilder;

        Predicate [] predicates = Stream.of(subscriptionPredicates())
                .flatMap(Collection::stream)
                .toArray(Predicate[] :: new);
        return criteriaBuilder.and(predicates);

    }

    private List<Predicate> subscriptionPredicates(){
        List<Predicate> predicates = new ArrayList<>();
        if(followerId != null) {
            Subquery<Long> subquery = query.subquery(Long.class);
            Root<Subscription> subRoot = subquery.from(Subscription.class);

            subquery.select(subRoot.get(Subscription_.authorId))
                    .where(cb.equal(subRoot.get(Subscription_.followerId), followerId));

            predicates.add(cb.and(cb.in(root.get(Video_.userId)).value(subquery), cb.equal(root.get(Video_.STATUS),VideoStatus.READY)));
        }
        return predicates;
    }

}
