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

CREATE TRIGGER trg_sync_profile_comment_likes
    AFTER INSERT OR DELETE ON profile_comment_likes
    FOR EACH ROW
EXECUTE FUNCTION update_profile_comment_likes_count();