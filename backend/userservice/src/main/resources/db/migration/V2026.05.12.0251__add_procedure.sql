CREATE OR REPLACE PROCEDURE process_user_reports()
    LANGUAGE plpgsql AS $$
BEGIN
    UPDATE user_reports
    SET status = 'PROCESSED'
    WHERE status = 'NEW' AND created_at < NOW() - INTERVAL '15 minutes';
    COMMIT;
END;
$$;

CREATE OR REPLACE PROCEDURE process_profile_comment_reports()
    LANGUAGE plpgsql AS $$
BEGIN
    UPDATE profile_comment_reports
    SET status = 'PROCESSED'
    WHERE status = 'NEW' AND created_at < NOW() - INTERVAL '15 minutes';
    COMMIT;
END;
$$;

ALTER TABLE profile_comments ADD COLUMN IF NOT EXISTS likes_count BIGINT DEFAULT 0;

-- Синхронизируем данные, если лайки уже были проставлены
UPDATE profile_comments pc
SET likes_count = (SELECT COUNT(*) FROM profile_comment_likes pcl WHERE pcl.comment_id = pc.id);

CREATE OR REPLACE FUNCTION update_profile_comment_likes_count()
    RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE profile_comments
        SET likes_count = likes_count + 1
        WHERE id = NEW.comment_id;
        RETURN NEW;

    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE profile_comments
        SET likes_count = likes_count - 1
        WHERE id = OLD.comment_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;