package org.recommendationsearchservice.service.elastic;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.recommendationsearchservice.entity.elastic.SearchIndexDoc;
import org.recommendationsearchservice.other.record.user.UserRecord;
import org.recommendationsearchservice.other.record.video.VideoRecord;
import org.recommendationsearchservice.repository.SearchRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class IndexingService {

    private final SearchRepository searchRepository;

    public void createVideoEntity(VideoRecord record) {
        searchRepository.save(new SearchIndexDoc(record));
        log.info("create video entity");
    }

    public void createUserEntity(UserRecord record) {
        searchRepository.save(new SearchIndexDoc(record));
    }
}
