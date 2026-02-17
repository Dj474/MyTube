package org.videoservice.repository.video;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.videoservice.entity.video.Video;
import org.videoservice.exception.NotFoundException;

import java.util.UUID;

public interface VideoRepository extends JpaRepository<Video, UUID>, JpaSpecificationExecutor<Video> {

    default Video byId(UUID id) {
        return findById(id).orElseThrow(() -> new NotFoundException("video with id = " + id + " not found"));
    }

}
