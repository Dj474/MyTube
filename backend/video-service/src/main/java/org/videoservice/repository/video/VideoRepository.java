package org.videoservice.repository.video;

import org.springframework.data.jpa.repository.JpaRepository;
import org.videoservice.entity.video.Video;

import java.util.UUID;

public interface VideoRepository extends JpaRepository<Video, UUID> {
}
