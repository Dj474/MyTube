CREATE TABLE comment_reports (
         id BIGSERIAL PRIMARY KEY,
         comment_id uuid NOT NULL references comments(id),
         reporter_id BIGINT NOT NULL,
         reason VARCHAR(50) NOT NULL,
         description TEXT,
         created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,

         CONSTRAINT unique_comment_reporter UNIQUE (comment_id, reporter_id)
);

CREATE INDEX idx_comment_reports_comment_id ON comment_reports(comment_id);