CREATE TABLE video_reports (
   id BIGSERIAL PRIMARY KEY,
   video_id UUID NOT NULL,
   reporter_id BIGINT NOT NULL,
   reason VARCHAR(50) NOT NULL, -- Например: SPAM, VIOLENCE, COPYRIGHT, etc.
   description TEXT,
   created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,

-- Ограничение, чтобы один пользователь не мог кинуть 100 репортов на одно и то же видео
   CONSTRAINT unique_video_reporter UNIQUE (video_id, reporter_id),

-- Внешний ключ на таблицу видео
   CONSTRAINT fk_video_report_video FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
);

-- Индекс для быстрой выборки всех жалоб на конкретное видео (для админки)
CREATE INDEX idx_video_reports_video_id ON video_reports(video_id);