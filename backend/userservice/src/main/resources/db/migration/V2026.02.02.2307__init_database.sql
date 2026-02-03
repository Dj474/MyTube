-- 1. Таблица пользователей (основная)
CREATE TABLE users (
       id BIGSERIAL PRIMARY KEY,
       username VARCHAR(50) UNIQUE NOT NULL,
       email VARCHAR(100) UNIQUE NOT NULL,
       password VARCHAR(255) NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Таблица профилей пользователей
CREATE TABLE user_profiles (
       user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
       first_name VARCHAR(50),
       last_name VARCHAR(50),
       bio TEXT,
       location VARCHAR(100),
       birth_date DATE,
       gender VARCHAR(20),
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);