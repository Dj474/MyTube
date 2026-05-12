CREATE OR REPLACE PROCEDURE process_video_reports()
    LANGUAGE plpgsql AS $$
BEGIN
    UPDATE video_reports
    SET status = 'PROCESSED'
    WHERE status = 'NEW' AND created_at < NOW() - INTERVAL '15 minutes';
END;
$$;