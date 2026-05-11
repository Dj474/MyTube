package org.videoservice.mapper.playlist;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.videoservice.dto.playlist.PlaylistDtoIn;
import org.videoservice.dto.playlist.PlaylistDtoOut;
import org.videoservice.entity.playlist.Playlist;

@Mapper(componentModel = "spring")
public abstract class PlaylistMapper {

    public abstract Playlist updateEntity(@MappingTarget Playlist playlist, PlaylistDtoIn dto);

    public abstract PlaylistDtoOut toDto(Playlist playlist);

}
