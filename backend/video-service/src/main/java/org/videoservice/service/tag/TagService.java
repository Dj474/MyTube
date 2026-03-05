package org.videoservice.service.tag;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.videoservice.dto.tag.TagDtoOut;
import org.videoservice.mapper.tag.TagMapper;
import org.videoservice.repository.tag.TagRepository;
import org.videoservice.specification.PageableParams;

@Service
@RequiredArgsConstructor
public class TagService {

    private final TagRepository tagRepository;
    private final TagMapper tagMapper;

    public Page<TagDtoOut> searchTags(String query, PageableParams params) {

        if (query.length() < 2) return null;

        return tagRepository.findByDisplayNameContainingIgnoreCase(query, params.toPageable())
                .map(tagMapper::toDto);
    }

}
