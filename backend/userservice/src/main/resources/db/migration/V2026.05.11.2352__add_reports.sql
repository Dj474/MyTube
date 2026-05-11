CREATE TABLE user_reports (
      id BIGSERIAL PRIMARY KEY,
      reporter_id BIGINT NOT NULL,      -- Кто жалуется
      target_user_id BIGINT NOT NULL,   -- На кого жалуются
      reason VARCHAR(50) NOT NULL,      -- Тип нарушения (ENUM)
      description TEXT,                 -- Подробности
      status VARCHAR(20) DEFAULT 'NEW', -- Статус (NEW, REVIEWED, REJECTED)
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      CONSTRAINT fk_reporter FOREIGN KEY (reporter_id) REFERENCES users(id),
      CONSTRAINT fk_target_user FOREIGN KEY (target_user_id) REFERENCES users(id)
);