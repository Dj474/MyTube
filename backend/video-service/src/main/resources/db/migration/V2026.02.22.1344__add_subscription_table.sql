CREATE TABLE subscriptions (
    id UUID primary key default gen_random_uuid(),
    follower_id bigint,
    author_id bigint
)