import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';
import { Sparkles, PlayCircle, Image as ImageIcon } from 'lucide-react';

// --- Компонент для загрузки защищенных превью (такой же как в MyVideos) ---
const ProtectedThumbnail = ({ url }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await api.get(url, { responseType: 'blob' });
        const objectUrl = URL.createObjectURL(response.data);
        setImageSrc(objectUrl);
      } catch (err) {
        console.error("Ошибка загрузки превью:", err);
      } finally {
        setLoading(false);
      }
    };

    if (url) fetchImage();
    return () => { if (imageSrc) URL.revokeObjectURL(imageSrc); };
  }, [url]);

  if (loading) return <div style={{ width: '100%', height: '100%', background: '#1e293b' }} />;
  if (!imageSrc) return (
    <div style={{ width: '100%', height: '100%', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <ImageIcon size={40} color="#475569" />
    </div>
  );

  return <img src={imageSrc} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
};

// --- Основной компонент ---
const RecommendationsPage = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/recommendation', { params: { page: 0, size: 12 } });
      const recData = res.data.content;

      const enrichedVideos = await Promise.all(
        recData.map(async (item) => {
          try {
            const videoRes = await api.get(`/videos/${item.videoId}`);
            return videoRes.data;
          } catch (e) {
            return null;
          }
        })
      );

      setVideos(enrichedVideos.filter(v => v !== null));
    } catch (err) {
      console.error("Ошибка рекомендаций:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={centerTextStyle}>Загрузка рекомендаций...</div>;

  return (
    <div>
      <header style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <Sparkles size={28} color="#facc15" />
        <h1 style={{ color: 'white', fontSize: '1.8rem', margin: 0 }}>Рекомендации</h1>
      </header>

      <div style={gridStyle}>
        {videos.map((video) => (
          <div 
            key={video.id} 
            onClick={() => navigate(`/video/${video.id}`)} 
            style={cardStyle}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            {/* Обертка для превью */}
            <div style={thumbnailWrapperStyle}>
              {/* Используем защищенную загрузку */}
              <ProtectedThumbnail url={video.thumbnailUrl} />
              
              {/* Оверлей с иконкой Play */}
              <div style={overlayStyle} className="play-overlay">
                 <PlayCircle size={48} color="white" fill="rgba(255,255,255,0.2)" />
              </div>
            </div>

            <div style={{ padding: '12px 4px' }}>
              <h3 style={videoTitleStyle}>{video.title}</h3>
              <p style={authorNameStyle}>{video.authorNickname}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Стили ---

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: '24px'
};

const cardStyle = {
  cursor: 'pointer',
  transition: 'transform 0.3s ease',
  position: 'relative'
};

const thumbnailWrapperStyle = {
  width: '100%',
  aspectRatio: '16/9',
  backgroundColor: '#1e293b',
  borderRadius: '12px',
  overflow: 'hidden',
  position: 'relative',
  border: '1px solid #334155'
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
  background: 'rgba(15, 23, 42, 0.4)',
  opacity: 0,
  transition: 'opacity 0.3s ease',
};

// Чтобы оверлей появлялся при наведении на карточку, 
// в CSS обычно используют селектор .card:hover .play-overlay. 
// В inline-styles это можно сделать через состояние, но для простоты оставим базовый вид.

const videoTitleStyle = {
  color: 'white',
  margin: '8px 0 4px 0',
  fontSize: '1rem',
  fontWeight: '600',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden'
};

const authorNameStyle = {
  color: '#94a3b8',
  fontSize: '0.9rem',
  margin: 0
};

const centerTextStyle = {
  color: '#94a3b8',
  textAlign: 'center',
  marginTop: '100px'
};

export default RecommendationsPage;