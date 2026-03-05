CREATE TABLE tags (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(50) NOT NULL
);

CREATE TABLE video_tags (
    video_id UUID NOT NULL,
    tag_id BIGINT NOT NULL,
    PRIMARY KEY (video_id, tag_id),
    CONSTRAINT fk_video FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
    CONSTRAINT fk_tag FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

INSERT INTO tags (name, display_name) VALUES
    ('programming', 'Программирование'),
    ('music', 'Музыка'),
    ('education', 'Образование'),
    ('gaming', 'Игры'),
    ('vlog', 'Влог');