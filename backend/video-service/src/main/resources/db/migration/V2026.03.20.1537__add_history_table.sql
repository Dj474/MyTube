CREATE TABLE history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id BIGINT,
    video_id UUID REFERENCES videos(id),
    created_at TIMESTAMP DEFAULT now()
)