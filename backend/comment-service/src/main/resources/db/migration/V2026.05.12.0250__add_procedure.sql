ALTER TABLE comment_reports
    ADD COLUMN status VARCHAR(20) DEFAULT 'NEW';

CREATE OR REPLACE PROCEDURE process_video_comment_reports()
    LANGUAGE plpgsql AS $$
BEGIN
    UPDATE comment_reports
    SET status = 'PROCESSED'
    WHERE status = 'NEW' AND created_at < NOW() - INTERVAL '15 minutes';
    COMMIT;
END;
$$;

-- Предположим, таблица называется comments (как в твоем REFERENCES)
ALTER TABLE comments ADD COLUMN IF NOT EXISTS likes_count BIGINT DEFAULT 0;

-- Синхронизируем текущие данные
UPDATE comments c
SET likes_count = (SELECT COUNT(*) FROM likes l WHERE l.comment_id = c.id);

CREATE OR REPLACE FUNCTION update_comment_likes_count()
    RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE comments
        SET likes_count = likes_count + 1
        WHERE id = NEW.comment_id;
        RETURN NEW;

    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE comments
        SET likes_count = likes_count - 1
        WHERE id = OLD.comment_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_comment_likes
    AFTER INSERT OR DELETE ON likes
    FOR EACH ROW
EXECUTE FUNCTION update_comment_likes_count();