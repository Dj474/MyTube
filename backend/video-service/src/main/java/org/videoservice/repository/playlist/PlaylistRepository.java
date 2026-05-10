package org.videoservice.repository.playlist;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.videoservice.entity.playlist.Playlist;
import org.videoservice.entity.video.Video;
import org.videoservice.exception.NotFoundException;

@Repository
public interface PlaylistRepository extends JpaRepository<Playlist,Long> {

    default Playlist byId(Long id) {
        return findById(id).orElseThrow(() -> new NotFoundException("playlist with id = " + id + " not found"));
    }

    Page<Playlist> getByUserId(Long userId, Pageable pageable);

    @Query("SELECT p.videos FROM Playlist p WHERE p.id = :playlistId")
    Page<Video> findVideosByPlaylistId(Long playlistId, Pageable pageable);

}
