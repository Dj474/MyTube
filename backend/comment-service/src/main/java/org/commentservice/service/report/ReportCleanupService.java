package org.commentservice.service.report;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@EnableScheduling
public class ReportCleanupService {

    @PersistenceContext
    private final EntityManager entityManager;

    /**
     * Выполняется каждые 5 минут (300 000 миллисекунд)
     * Асинхронно, чтобы не блокировать поток планировщика
     */
    @Async
    @Scheduled(fixedRate = 300000)
    @Transactional // Обязательно для UPDATE внутри процедуры
    public void runVideoReportsCleanup() {
        try {
            log.info("Запуск плановой обработки отчетов...");

            // Вызов процедуры PostgreSQL
            entityManager.createNativeQuery("CALL process_video_comment_reports()").executeUpdate();

            log.info("Обработка отчетов успешно завершена.");
        } catch (Exception e) {
            log.error("Ошибка при выполнении процедуры process_video_reports: ", e);
        }
    }
}
