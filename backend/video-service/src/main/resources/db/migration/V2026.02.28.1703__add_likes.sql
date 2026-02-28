CREATE TABLE likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id UUID REFERENCES videos(id),
    user_id BIGINT,
    created_at TIMESTAMP DEFAULT now()
)