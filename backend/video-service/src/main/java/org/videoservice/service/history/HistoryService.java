package org.videoservice.service.history;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.videoservice.dto.history.HistoryDtoIn;
import org.videoservice.dto.history.HistoryDtoOut;
import org.videoservice.entity.history.History;
import org.videoservice.entity.history.History_;
import org.videoservice.entity.video.Video;
import org.videoservice.mapper.history.HistoryMapper;
import org.videoservice.other.record.kafka.VideoHistoryEvent;
import org.videoservice.repository.history.HistoryRepository;
import org.videoservice.repository.video.VideoRepository;
import org.videoservice.service.kafka.KafkaProducerService;
import org.videoservice.specification.PageableParams;

@Service
@RequiredArgsConstructor
public class HistoryService {

    private final HistoryRepository historyRepository;
    private final VideoRepository videoRepository;
    private final KafkaProducerService kafkaService;
    private final HistoryMapper historyMapper;

    public void addToHistory(HistoryDtoIn dto, Long userId) {
        Video video = videoRepository.byId(dto.getVideoId());
        History history = historyRepository.save(new History(userId, video));

        kafkaService.sendHistoryEvent(new VideoHistoryEvent(history.getId(), history.getUserId(), history.getVideo().getId()));
    }

    public Page<HistoryDtoOut> getHistory(PageableParams params, Long userId){
        Pageable pageable = params.toPageable(Sort.by(Sort.Direction.ASC, History_.CREATED_AT));
        Page<History> histories = historyRepository.findByUserId(userId, pageable);
        return histories.map(historyMapper::toDto);
    }

}
