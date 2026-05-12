package org.userservice.service.comment;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.userservice.dto.comment.ProfileCommentDto;
import org.userservice.entity.comment.ProfileComment;
import org.userservice.entity.comment.ProfileCommentLike;
import org.userservice.entity.comment.ProfileCommentReport;
import org.userservice.entity.user.User;
import org.userservice.other.enums.report.ReportReason;
import org.userservice.repository.comment.ProfileCommentLikeRepository;
import org.userservice.repository.comment.ProfileCommentReportRepository;
import org.userservice.repository.comment.ProfileCommentRepository;
import org.userservice.repository.user.UserRepository;
import org.userservice.service.user.UserService;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ProfileInteractionService {

    private final ProfileCommentRepository commentRepository;
    private final ProfileCommentLikeRepository likeRepository; // Добавили репозиторий
    private final ProfileCommentReportRepository reportRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    @Transactional
    public void addComment(Long profileId, String content) {
        User author = userService.getCurrent();
        User profile = userRepository.findById(profileId)
                .orElseThrow(() -> new RuntimeException("Профиль не найден"));

        ProfileComment comment = ProfileComment.builder()
                .author(author)
                .profile(profile)
                .content(content)
                .createdAt(LocalDateTime.now())
                .build();
        commentRepository.save(comment);
    }

    @Transactional
    public void toggleLike(Long commentId) {

        User curr = userService.getCurrent();
        // Проверяем, существует ли комментарий
        if (!commentRepository.existsById(commentId)) {
            throw new RuntimeException("Комментарий не найден");
        }

        // Ищем существующий лайк через репозиторий
        likeRepository.findByUserIdAndCommentId(curr.getId(), commentId)
                .ifPresentOrElse(
                        // Если лайк есть — удаляем его (дизлайк)
                        like -> likeRepository.delete(like),
                        // Если лайка нет — создаем новый
                        () -> {
                            ProfileCommentLike newLike = ProfileCommentLike.builder()
                                    .userId(curr.getId())
                                    .commentId(commentId)
                                    .createdAt(LocalDateTime.now())
                                    .build();
                            likeRepository.save(newLike);
                        }
                );
    }

    @Transactional
    public void reportComment(Long commentId, String reason) {
        User reporter = userService.getCurrent();
        ProfileComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Комментарий не найден"));

        // Проверяем, не кидал ли юзер репорт на этот коммент ранее (опционально)
        if (reportRepository.existsByReporterIdAndCommentId(reporter.getId(), commentId)) {
            throw new RuntimeException("Вы уже пожаловались на этот комментарий");
        }

        ProfileCommentReport report = ProfileCommentReport.builder()
                .reporter(reporter)
                .comment(comment)
                .reason(ReportReason.valueOf(reason.toUpperCase()))
                .status("NEW")
                .createdAt(LocalDateTime.now())
                .build();
        reportRepository.save(report);
    }

    @Transactional(readOnly = true)
    public Page<ProfileCommentDto> getComments(Long profileId, Pageable pageable) {
        Long viewerId = userService.getCurrent().getId();
        return commentRepository.findAllByProfileIdOrderByCreatedAtDesc(profileId, pageable)
                .map(comment -> {
                    long likes = likeRepository.countByCommentId(comment.getId());
                    boolean likedByMe = viewerId != null &&
                            likeRepository.existsByUserIdAndCommentId(viewerId, comment.getId());

                    return ProfileCommentDto.builder()
                            .id(comment.getId())
                            .authorId(comment.getAuthor().getId())
                            .authorNickname(comment.getAuthor().getProfile().getFirstName())
                            .content(comment.getContent())
                            .createdAt(comment.getCreatedAt())
                            .likesCount(comment.getLikesCount())
                            .isLiked(likedByMe)
                            .build();
                });
    }
}