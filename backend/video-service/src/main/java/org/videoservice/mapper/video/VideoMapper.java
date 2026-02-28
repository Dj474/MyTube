package org.videoservice.mapper.video;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.beans.factory.annotation.Autowired;
import org.videoservice.dto.video.VideoInfoDtoOut;
import org.videoservice.entity.video.Video;
import org.videoservice.repository.like.LikeRepository;

@Mapper(componentModel = "spring")
public abstract class VideoMapper {

    @Autowired
    protected LikeRepository likeRepository;

    public abstract VideoInfoDtoOut toDto(Video video);

    @Mapping(target = "isLiked", expression = "java(isLiked(video, userId))")
    @Mapping(target = "amountOfLikes", expression = "java(getAmountOfLikes(video))")
    public abstract VideoInfoDtoOut toDtoWithLikes(Video video, Long userId);

    protected Boolean isLiked(Video video, Long userId) {
        return likeRepository.existsByUserIdAndVideo(userId, video);
    }

    protected Long getAmountOfLikes(Video video) {
        return likeRepository.countByVideo(video);
    }


}
