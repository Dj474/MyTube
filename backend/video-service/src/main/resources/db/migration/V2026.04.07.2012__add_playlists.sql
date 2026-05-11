CREATE TABLE playlists (
   id BIGSERIAL PRIMARY KEY,
   title VARCHAR(255) NOT NULL,
   description TEXT,
   user_id BIGINT NOT NULL,
   created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
   updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE playlist_videos (
     playlist_id BIGINT NOT NULL,
     video_id UUID NOT NULL,
     added_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
     position INTEGER,

     PRIMARY KEY (playlist_id, video_id),
     CONSTRAINT fk_playlist FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
     CONSTRAINT fk_video FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
);

CREATE INDEX idx_playlists_user_id ON playlists(user_id);
CREATE INDEX idx_playlist_videos_playlist_id ON playlist_videos(playlist_id);