package org.videoservice.service.like;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.videoservice.entity.like.Like;
import org.videoservice.entity.video.Video;
import org.videoservice.exception.BadRequestException;
import org.videoservice.repository.like.LikeRepository;
import org.videoservice.repository.video.VideoRepository;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LikeService {

    private final LikeRepository likeRepository;
    private final VideoRepository videoRepository;

    public void createLike(Long userId, UUID commentId) {
        Video video = videoRepository.byId(commentId);
        if (likeRepository.existsByUserIdAndVideo(userId, video)) {
            throw new BadRequestException("comment already liked");
        }
        Like like = new Like(userId, video);
        likeRepository.save(like);
    }

    public void deleteLike(Long userId, UUID commentId) {
        Video video = videoRepository.byId(commentId);
        if (!likeRepository.existsByUserIdAndVideo(userId, video)) {
            throw new BadRequestException("comment already liked");
        }
        Like like = new Like(userId, video);
        likeRepository.delete(like);
    }

}
