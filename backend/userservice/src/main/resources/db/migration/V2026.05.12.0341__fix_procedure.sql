CREATE OR REPLACE PROCEDURE process_user_reports()
    LANGUAGE plpgsql AS $$
BEGIN
    UPDATE user_reports
    SET status = 'PROCESSED'
    WHERE status = 'NEW' AND created_at < NOW() - INTERVAL '15 minutes';
END;
$$;

CREATE OR REPLACE PROCEDURE process_profile_comment_reports()
    LANGUAGE plpgsql AS $$
BEGIN
    UPDATE profile_comment_reports
    SET status = 'PROCESSED'
    WHERE status = 'NEW' AND created_at < NOW() - INTERVAL '15 minutes';
END;
$$;