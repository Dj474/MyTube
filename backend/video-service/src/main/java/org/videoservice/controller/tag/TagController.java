package org.videoservice.controller.tag;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.videoservice.dto.tag.TagDtoOut;
import org.videoservice.service.tag.TagService;
import org.videoservice.specification.PageableParams;

@RestController
@RequestMapping("/api/v1/videos/tags")
@RequiredArgsConstructor
public class TagController {

    private final TagService tagService;

    @GetMapping("/search")
    public Page<TagDtoOut> searchTags(@RequestParam String query, PageableParams params) {
        return tagService.searchTags(query, params);
    }

}
