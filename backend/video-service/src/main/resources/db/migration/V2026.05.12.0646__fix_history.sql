-- 1. Удаляем существующее ограничение внешнего ключа.
-- Имя ограничения в PostgreSQL обычно формируется как "history_video_id_fkey",
-- если оно не было задано вручную.
ALTER TABLE history
    DROP CONSTRAINT IF EXISTS history_video_id_fkey;

-- 2. Добавляем новое ограничение с каскадным удалением
ALTER TABLE history
    ADD CONSTRAINT history_video_id_fkey
        FOREIGN KEY (video_id)
            REFERENCES videos(id)
            ON DELETE CASCADE;