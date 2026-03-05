package org.videoservice.repository.tag;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.videoservice.entity.tag.Tag;

public interface TagRepository extends JpaRepository<Tag, Long> {

    Page<Tag> findByDisplayNameContainingIgnoreCase(String query, Pageable pageable);

}
