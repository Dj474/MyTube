CREATE TABLE search_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL, -- ID видео или ID пользователя
  entity_type VARCHAR(20) NOT NULL, -- 'VIDEO' или 'USER'
  title TEXT, -- Для видео: название; для пользователя: никнейм
  content TEXT, -- Для видео: описание; для пользователя: "о себе"
  tags TEXT -- Теги видео в виде строки через пробел или массив
);
