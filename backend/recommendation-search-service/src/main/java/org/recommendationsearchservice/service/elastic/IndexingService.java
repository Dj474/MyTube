package org.recommendationsearchservice.service.elastic;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.recommendationsearchservice.entity.elastic.SearchIndexDoc;
import org.recommendationsearchservice.entity.history.HistoryDoc;
import org.recommendationsearchservice.other.record.history.HistoryRecord;
import org.recommendationsearchservice.other.record.user.UserRecord;
import org.recommendationsearchservice.other.record.video.VideoRecord;
import org.recommendationsearchservice.repository.SearchRepository;
import org.recommendationsearchservice.repository.history.HistoryRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class IndexingService {

    private final SearchRepository searchRepository;
    private final HistoryRepository historyRepository;

    public void createVideoEntity(VideoRecord record) {
        searchRepository.save(new SearchIndexDoc(record));
        log.info("create video entity");
    }

    public void createUserEntity(UserRecord record) {
        searchRepository.save(new SearchIndexDoc(record));
    }

    public void createHistoryEntity(HistoryRecord record) {
        historyRepository.save(new HistoryDoc(record));
    }
}
