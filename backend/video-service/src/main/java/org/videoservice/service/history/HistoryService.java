package org.videoservice.service.history;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.videoservice.dto.history.HistoryDtoIn;
import org.videoservice.dto.history.HistoryDtoOut;
import org.videoservice.entity.history.History;
import org.videoservice.entity.history.History_;
import org.videoservice.entity.tag.Tag;
import org.videoservice.entity.video.Video;
import org.videoservice.mapper.history.HistoryMapper;
import org.videoservice.other.record.kafka.VideoHistoryEvent;
import org.videoservice.repository.history.HistoryRepository;
import org.videoservice.repository.video.VideoRepository;
import org.videoservice.service.kafka.KafkaProducerService;
import org.videoservice.specification.PageableParams;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HistoryService {

    private final HistoryRepository historyRepository;
    private final VideoRepository videoRepository;
    private final KafkaProducerService kafkaService;
    private final HistoryMapper historyMapper;

    @Transactional
    public void addToHistory(HistoryDtoIn dto, Long userId) {
        Video video = videoRepository.byId(dto.getVideoId());

        historyRepository.deleteAllByUserIdAndVideoId(userId, dto.getVideoId());

        historyRepository.flush();

        History history = historyRepository.save(new History(userId, video));

        String stringTags = video.getTags().stream()
                .map(Tag::getDisplayName)
                .collect(Collectors.joining(" "));

        kafkaService.sendHistoryEvent(new VideoHistoryEvent(
                history.getId(),
                history.getUserId(),
                history.getVideo().getId(),
                stringTags
        ));
    }

    public Page<HistoryDtoOut> getHistory(PageableParams params, Long userId){
        Pageable pageable = params.toPageable(Sort.by(Sort.Direction.DESC, History_.CREATED_AT));
        Page<History> histories = historyRepository.findByUserId(userId, pageable);
        return histories.map(historyMapper::toDto);
    }

}
