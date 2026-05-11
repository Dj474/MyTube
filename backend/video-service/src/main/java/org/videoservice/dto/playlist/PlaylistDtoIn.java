package org.videoservice.dto.playlist;

import jakarta.persistence.Column;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PlaylistDtoIn {

    private String title;

    private String description;

}
