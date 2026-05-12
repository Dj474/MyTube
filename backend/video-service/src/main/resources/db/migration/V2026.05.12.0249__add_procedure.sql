ALTER TABLE video_reports
    ADD COLUMN status VARCHAR(20) DEFAULT 'NEW';

CREATE OR REPLACE PROCEDURE process_video_reports()
    LANGUAGE plpgsql AS $$
BEGIN
    UPDATE video_reports
    SET status = 'PROCESSED'
    WHERE status = 'NEW' AND created_at < NOW() - INTERVAL '15 minutes';
    COMMIT;
END;
$$;

-- Добавляем колонку, если её еще нет
ALTER TABLE videos ADD COLUMN IF NOT EXISTS likes_count BIGINT DEFAULT 0;

-- Синхронизируем данные, если в таблице likes уже есть записи
UPDATE videos v
SET likes_count = (SELECT COUNT(*) FROM likes l WHERE l.video_id = v.id);

CREATE OR REPLACE FUNCTION update_video_likes_count()
    RETURNS TRIGGER AS $$
BEGIN
    -- Если поставили лайк
    IF (TG_OP = 'INSERT') THEN
        UPDATE videos
        SET likes_count = likes_count + 1
        WHERE id = NEW.video_id;
        RETURN NEW;

        -- Если убрали лайк
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE videos
        SET likes_count = likes_count - 1
        WHERE id = OLD.video_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
