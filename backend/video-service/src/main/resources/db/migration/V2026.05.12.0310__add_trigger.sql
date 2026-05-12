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

CREATE TRIGGER trg_sync_video_likes
    AFTER INSERT OR DELETE ON likes
    FOR EACH ROW
EXECUTE FUNCTION update_video_likes_count();