package org.userservice.repository.comment;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.userservice.entity.comment.ProfileComment;

@Repository
public interface ProfileCommentRepository extends JpaRepository<ProfileComment, Long> {

    // Получить все комментарии профиля с пагинацией (от новых к старым)
    Page<ProfileComment> findAllByProfileIdOrderByCreatedAtDesc(Long profileId, Pageable pageable);

    // Посчитать количество комментариев у пользователя
    long countByProfileId(Long profileId);
}