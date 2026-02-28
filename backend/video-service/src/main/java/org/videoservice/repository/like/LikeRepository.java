package org.videoservice.repository.like;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.videoservice.entity.like.Like;
import org.videoservice.entity.video.Video;

import java.util.UUID;

@Repository
public interface LikeRepository extends JpaRepository<Like, UUID> {

    Boolean existsByUserIdAndVideo(Long userId, Video video);

    Long countByVideo(Video video);

}
