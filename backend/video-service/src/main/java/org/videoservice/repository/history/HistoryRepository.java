package org.videoservice.repository.history;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import org.videoservice.entity.history.History;

import java.util.UUID;

@Repository
public interface HistoryRepository extends JpaRepository<History, UUID>, JpaSpecificationExecutor<History> {

    Page<History> findByUserId(Long userId, Pageable pageable);

}
