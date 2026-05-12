CREATE TABLE video_statuses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- Наполнение справочника базовыми значениями
INSERT INTO video_statuses (name) VALUES
      ('UPLOADING'),
      ('PROCESSING'),
      ('READY'),
      ('ERROR');

CREATE TABLE report_reasons (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    label VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL
);

-- Наполнение справочника примерами причин
INSERT INTO report_reasons (code, label) VALUES
     ('SPAM', 'Спам или реклама'),
     ('VIOLENCE', 'Насилие или жестокий контент'),
     ('HATE_SPEECH', 'Враждебные высказывания'),
     ('COPYRIGHT', 'Нарушение авторских прав'),
     ('INAPPROPRIATE', 'Неприемлемый контент');