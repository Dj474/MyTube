CREATE TABLE videos (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,

    -- Путь к мастер-плейлисту в S3 (например, "videos/uuid/master.m3u8")
    -- Или путь к исходному файлу, пока идет обработка
    s3_key VARCHAR(512) NOT NULL,

    -- ID пользователя, который загрузил видео (из X-User-Id)
    user_id BIGINT NOT NULL,

    -- Статус: UPLOADING, PROCESSING, READY, ERROR
    status VARCHAR(50) DEFAULT 'UPLOADING',

    -- Ссылка на превью (thumbnail)
    thumbnail_url VARCHAR(512),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);