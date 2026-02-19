package org.videoprocessservice.video;

import org.springframework.data.jpa.repository.JpaRepository;
import org.videoprocessservice.entity.video.Video;

import java.util.UUID;

public interface VideoRepository extends JpaRepository<Video, UUID> {
}
