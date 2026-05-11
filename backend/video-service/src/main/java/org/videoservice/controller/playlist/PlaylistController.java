package org.videoservice.controller.playlist;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;
import org.videoservice.dto.playlist.PlaylistDtoIn;
import org.videoservice.dto.playlist.PlaylistDtoOut;
import org.videoservice.dto.video.VideoInfoDtoOut;
import org.videoservice.service.playlist.PlaylistService;
import org.videoservice.specification.PageableParams;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/videos/playlist")
@RequiredArgsConstructor
public class PlaylistController {

    private final PlaylistService playlistService;

    @PostMapping
    public PlaylistDtoOut create(@RequestBody PlaylistDtoIn dtoIn,
                                 @RequestHeader("X-User-Id") Long userId) {
        return playlistService.createPlaylist(dtoIn, userId);
    }

    @PutMapping("/{playlistId}")
    public PlaylistDtoOut update(@PathVariable Long playlistId,
                                 @RequestBody PlaylistDtoIn dtoIn,
                                 @RequestHeader("X-User-Id") Long userId) {
        return playlistService.updatePlaylist(dtoIn, playlistId, userId);
    }

    @GetMapping("/my")
    public Page<PlaylistDtoOut> getMyPlaylists(PageableParams params,
                                               @RequestHeader("X-User-Id") Long userId) {
        return playlistService.getUserPlaylists(userId, params);
    }

    @GetMapping("/{playlistId}/videos")
    public Page<VideoInfoDtoOut> getVideosFromPlaylist(@PathVariable Long playlistId,
                                                       PageableParams params,
                                                       @RequestHeader("X-User-Id") Long userId) {
        return playlistService.getVideoForPlaylist(playlistId, userId, params);
    }

    @PostMapping("/{playlistId}/videos/{videoId}")
    public void addVideo(@PathVariable Long playlistId,
                         @PathVariable UUID videoId,
                         @RequestHeader("X-User-Id") Long userId) {
        playlistService.addVideoToPlaylist(videoId, playlistId, userId);
    }

    @DeleteMapping("/{playlistId}/videos/{videoId}")
    public void removeVideo(@PathVariable Long playlistId,
                            @PathVariable UUID videoId,
                            @RequestHeader("X-User-Id") Long userId) {
        playlistService.removeVideoFromPlaylist(videoId, playlistId, userId);
    }

    @DeleteMapping("/{playlistId}")
    public void deletePlaylist(@PathVariable Long playlistId,
                               @RequestHeader("X-User-Id") Long userId) {
        playlistService.deletePlaylist(playlistId, userId);
    }
}