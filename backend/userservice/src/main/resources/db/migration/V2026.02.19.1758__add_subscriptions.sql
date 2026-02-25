CREATE TABLE subscriptions (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       follower_id BIGINT NOT NULL REFERENCES users(id),
       author_id BIGINT NOT NULL REFERENCES users(id),
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)