package org.videoservice.entity.tag;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.videoservice.entity.video.Video;

import java.util.List;

@Entity
@Table(name = "tags")
@Getter
@Setter
public class Tag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String displayName;

    @ManyToMany(mappedBy = "tags")
    private List<Video> videos;
}