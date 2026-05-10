package org.videoservice.service.playlist;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.videoservice.dto.playlist.PlaylistDtoIn;
import org.videoservice.dto.playlist.PlaylistDtoOut;
import org.videoservice.dto.video.VideoInfoDtoOut;
import org.videoservice.entity.playlist.Playlist;
import org.videoservice.entity.video.Video;
import org.videoservice.exception.ForbiddenException;
import org.videoservice.mapper.playlist.PlaylistMapper;
import org.videoservice.mapper.video.VideoMapper;
import org.videoservice.repository.playlist.PlaylistRepository;
import org.videoservice.repository.video.VideoRepository;
import org.videoservice.specification.PageableParams;

import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PlaylistService {

    private final PlaylistRepository playlistRepository;
    private final PlaylistMapper playlistMapper;
    private final VideoMapper videoMapper;
    private final VideoRepository videoRepository;

    public PlaylistDtoOut createPlaylist(PlaylistDtoIn dto, Long userId) {
        Playlist playlist = playlistMapper.updateEntity(new Playlist(), dto);

        playlist.setUserId(userId);

        playlistRepository.save(playlist);
        return playlistMapper.toDto(playlist);
    }

    public PlaylistDtoOut updatePlaylist(PlaylistDtoIn dto, Long playlistId, Long userId) {
        Playlist playlist = playlistRepository.byId(playlistId);

        if (!Objects.equals(playlist.getUserId(), userId)) {
            throw new ForbiddenException("you cant access other users playlists");
        }

        playlist = playlistMapper.updateEntity(playlist, dto);

        playlistRepository.save(playlist);
        return playlistMapper.toDto(playlist);
    }

    public Page<PlaylistDtoOut> getUserPlaylists(Long userId, PageableParams params) {
        Pageable pageable = params.toPageable();
        Page<Playlist> playlists = playlistRepository.getByUserId(userId, pageable);
        return playlists.map(playlistMapper::toDto);
    }

    public Page<VideoInfoDtoOut> getVideoForPlaylist(Long playlistId, Long userId, PageableParams params) {
        Playlist playlist = playlistRepository.byId(playlistId);

        if (!Objects.equals(playlist.getUserId(), userId)) {
            throw new ForbiddenException("you cant access other users playlists");
        }

        Pageable pageable = params.toPageable();

        Page<Video> videosPage = playlistRepository.findVideosByPlaylistId(playlistId, pageable);

        return videosPage.map(videoMapper::toDto);
    }

    public void addVideoToPlaylist(UUID videoId, Long playlistId, Long userId) {
        Playlist playlist = playlistRepository.byId(playlistId);

        if (!Objects.equals(playlist.getUserId(), userId)) {
            throw new ForbiddenException("you cant access other users playlists");
        }
        Video video = videoRepository.byId(videoId);
        playlist.getVideos().add(video);
        playlistRepository.save(playlist);
    }

    public void deletePlaylist(Long playlistId, Long userId) {
        Playlist playlist = playlistRepository.byId(playlistId);

        if (!Objects.equals(playlist.getUserId(), userId)) {
            throw new ForbiddenException("You can only delete your own playlists");
        }

        playlistRepository.delete(playlist);
    }

    public void removeVideoFromPlaylist(UUID videoId, Long playlistId, Long userId) {
        Playlist playlist = playlistRepository.byId(playlistId);

        if (!Objects.equals(playlist.getUserId(), userId)) {
            throw new ForbiddenException("You can only edit your own playlists");
        }

        // Удаляем видео из списка по его ID
        playlist.getVideos().removeIf(v -> v.getId().equals(videoId));
        playlistRepository.save(playlist);
    }

}
