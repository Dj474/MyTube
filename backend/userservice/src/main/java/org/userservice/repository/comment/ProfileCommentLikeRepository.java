package org.userservice.repository.comment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.userservice.entity.comment.ProfileCommentLike;

import java.util.Optional;

public interface ProfileCommentLikeRepository extends JpaRepository<ProfileCommentLike, Long> {

    // Поиск лайка по пользователю и комменту
    Optional<ProfileCommentLike> findByUserIdAndCommentId(Long userId, Long commentId);

    boolean existsByUserIdAndCommentId(Long userId, Long commentId);

    long countByCommentId(Long commentId);
}
