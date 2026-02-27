CREATE TABLE likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID REFERENCES comments(id),
    user_id BIGINT,
    created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX like_comment_idx on likes(comment_id);