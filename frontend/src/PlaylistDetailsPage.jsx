import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from './api';
import { PlayCircle, ChevronLeft, Trash2 } from 'lucide-react'; // Добавил иконку корзины

// Тот самый компонент для защищенных превью
const ProtectedThumbnail = ({ url }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchImage = async () => {
      try {
        const response = await api.get(url, { responseType: 'blob' });
        if (isMounted) {
          const objectUrl = URL.createObjectURL(response.data);
          setImageSrc(objectUrl);
        }
      } catch (err) { console.error(err); } 
      finally { if (isMounted) setLoading(false); }
    };
    if (url) fetchImage();
    return () => { 
      isMounted = false;
      if (imageSrc) URL.revokeObjectURL(imageSrc); 
    };
  }, [url]);

  if (loading) return <div style={{ width: '100%', height: '100%', background: '#1e293b' }} />;
  return <img src={imageSrc || ""} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
};

const PlaylistDetailsPage = () => {
  const { playlistId } = useParams();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchVideos();
  }, [playlistId]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/videos/playlist/${playlistId}/videos`, { params: { page: 0, size: 50 } });
      setVideos(res.data.content || []);
    } catch (err) {
      console.error("Ошибка при загрузке видео плейлиста:", err);
    } finally {
      setLoading(false);
    }
  };

  // ФУНКЦИЯ УДАЛЕНИЯ
  const handleRemoveVideo = async (e, videoId) => {
    e.stopPropagation(); // Чтобы не сработал переход на видео при клике на корзину
    if (!window.confirm("Удалить это видео из плейлиста?")) return;

    try {
      // DELETE запрос согласно твоему контроллеру
      await api.delete(`/videos/playlist/${playlistId}/videos/${videoId}`);
      
      // Удаляем видео из локального стейта, чтобы оно исчезло с экрана
      setVideos(videos.filter(v => v.id !== videoId));
    } catch (err) {
      console.error("Ошибка при удалении видео:", err);
      alert("Не удалось удалить видео");
    }
  };

  if (loading) return <div style={centerTextStyle}>Загрузка видео...</div>;

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <button onClick={() => navigate(-1)} style={backButtonStyle}>
        <ChevronLeft size={20} /> Назад к плейлистам
      </button>

      <h1 style={{ color: 'white', marginBottom: '32px' }}>Видео в плейлисте</h1>

      {videos.length === 0 ? (
        <div style={centerTextStyle}>В этом плейлисте пока нет видео</div>
      ) : (
        <div style={videoGridStyle}>
          {videos.map((video) => (
            <div 
              key={video.id} 
              onClick={() => navigate(`/video/${video.id}`)} 
              style={videoCardStyle}
            >
              <div style={thumbnailWrapperStyle}>
                <ProtectedThumbnail url={video.thumbnailUrl} />
                
                {/* Кнопка удаления */}
                <button 
                  onClick={(e) => handleRemoveVideo(e, video.id)}
                  style={deleteButtonStyle}
                  title="Удалить из плейлиста"
                >
                  <Trash2 size={18} color="white" />
                </button>

                <div className="video-overlay" style={overlayStyle}>
                  <PlayCircle size={48} color="white" />
                </div>
              </div>
              <div style={{ padding: '12px 4px' }}>
                <h3 style={videoTitleStyle}>{video.title}</h3>
                <p style={authorNameStyle}>{video.authorNickname}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Стили ---
const videoGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' };

const videoCardStyle = { 
  cursor: 'pointer', 
  transition: 'transform 0.2s ease',
  position: 'relative' 
};

const thumbnailWrapperStyle = { 
  width: '100%', 
  aspectRatio: '16/9', 
  backgroundColor: '#1e293b', 
  borderRadius: '12px', 
  overflow: 'hidden', 
  position: 'relative' 
};

const overlayStyle = { 
  position: 'absolute', 
  top: 0, 
  left: 0, 
  width: '100%', 
  height: '100%', 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center', 
  background: 'rgba(0,0,0,0.3)', 
  opacity: 0, 
  transition: '0.3s' 
};

// Стиль для кнопки удаления
const deleteButtonStyle = {
  position: 'absolute',
  top: '8px',
  right: '8px',
  zIndex: 10,
  backgroundColor: 'rgba(239, 68, 68, 0.8)', // Красный полупрозрачный
  border: 'none',
  borderRadius: '8px',
  padding: '8px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: '0.2s',
  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
};

const videoTitleStyle = { color: 'white', margin: '8px 0 4px 0', fontSize: '1rem', fontWeight: '600' };
const authorNameStyle = { color: '#94a3b8', fontSize: '0.9rem', margin: 0 };
const backButtonStyle = { background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', display: 'flex', alignItems: 'center', marginBottom: '20px', padding: 0 };
const centerTextStyle = { color: '#94a3b8', textAlign: 'center', marginTop: '100px' };

export default PlaylistDetailsPage;