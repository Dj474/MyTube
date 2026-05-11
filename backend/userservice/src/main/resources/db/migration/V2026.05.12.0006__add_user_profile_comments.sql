-- 1. Комментарии в профиле
CREATE TABLE profile_comments (
      id BIGSERIAL PRIMARY KEY,
      author_id BIGINT NOT NULL,       -- Кто написал
      profile_id BIGINT NOT NULL,      -- В чьем профиле написано
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_comment_author FOREIGN KEY (author_id) REFERENCES users(id),
      CONSTRAINT fk_profile_owner FOREIGN KEY (profile_id) REFERENCES users(id)
);

-- 2. Лайки к комментариям профиля
CREATE TABLE profile_comment_likes (
   id BIGSERIAL PRIMARY KEY,
   user_id BIGINT NOT NULL,
   comment_id BIGINT NOT NULL,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   CONSTRAINT fk_like_user FOREIGN KEY (user_id) REFERENCES users(id),
   CONSTRAINT fk_like_comment FOREIGN KEY (comment_id) REFERENCES profile_comments(id) ON DELETE CASCADE,
   CONSTRAINT unique_user_comment_like UNIQUE (user_id, comment_id)
);

-- 3. Жалобы на комментарии профиля
CREATE TABLE profile_comment_reports (
     id BIGSERIAL PRIMARY KEY,
     reporter_id BIGINT NOT NULL,
     comment_id BIGINT NOT NULL,
     reason VARCHAR(50) NOT NULL,
     status VARCHAR(20) DEFAULT 'NEW',
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     CONSTRAINT fk_rep_user FOREIGN KEY (reporter_id) REFERENCES users(id),
     CONSTRAINT fk_rep_comment FOREIGN KEY (comment_id) REFERENCES profile_comments(id) ON DELETE CASCADE
);