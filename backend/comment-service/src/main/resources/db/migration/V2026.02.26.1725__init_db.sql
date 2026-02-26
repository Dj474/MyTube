CREATE TABLE comments (
      id UUID PRIMARY KEY,
      video_id UUID NOT NULL,
      user_id BIGINT NOT NULL,
      content TEXT NOT NULL,
      parent_id UUID, -- Для ответов на комментарии
      created_at TIMESTAMP NOT NULL,
      updated_at TIMESTAMP,
      CONSTRAINT fk_parent_comment FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
);
CREATE INDEX idx_comments_video_id ON comments(video_id);