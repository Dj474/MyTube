import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';
import { Clock, PlayCircle, ChevronRight, Film } from 'lucide-react';

const HistoryPage = () => {
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/videos/history', { params: { page: 0, size: 20 } });
      const historyData = res.data.content;

      const enrichedHistory = await Promise.all(
        historyData.map(async (item) => {
          try {
            const videoRes = await api.get(`/videos/${item.videoId}`);
            const video = videoRes.data;

            // --- ПОДГРУЗКА ПРЕВЬЮ ---
            // Предполагаем, что у видео есть поле thumbnailUrl или photoUrl
            let imageUrl = null;
            if (video.thumbnailUrl) {
              try {
                const imgRes = await api.get(video.thumbnailUrl, { responseType: 'blob' });
                imageUrl = URL.createObjectURL(imgRes.data);
              } catch (e) {
                console.error("Ошибка загрузки превью для видео:", video.id);
              }
            }

            return { ...video, displayImage: imageUrl };
          } catch (e) {
            return null;
          }
        })
      );

      setHistoryItems(enrichedHistory.filter(item => item !== null));
    } catch (err) {
      setError("Не удалось загрузить историю");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Очистка URL объектов для предотвращения утечек памяти
  useEffect(() => {
    return () => {
      historyItems.forEach(item => {
        if (item.displayImage) URL.revokeObjectURL(item.displayImage);
      });
    };
  }, [historyItems]);

  if (loading) return <div style={centerTextStyle}>Загрузка истории...</div>;
  if (error) return <div style={{ ...centerTextStyle, color: '#ef4444' }}>{error}</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <Clock size={28} color="#3b82f6" />
        <h1 style={{ color: 'white', fontSize: '1.8rem', margin: 0 }}>История просмотров</h1>
      </header>

      {historyItems.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {historyItems.map((video, index) => (
            <div 
              key={index} 
              onClick={() => navigate(`/video/${video.id}`)}
              style={historyCardStyle}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2d3748'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1e293b'}
            >
              {/* ПРЕВЬЮ ВИДЕО */}
              <div style={thumbnailStyle}>
                {video.displayImage ? (
                  <img 
                    src={video.displayImage} 
                    alt={video.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} 
                  />
                ) : (
                  <Film size={32} color="#475569" />
                )}
                <div style={playOverlayStyle}>
                  <PlayCircle size={32} color="white" />
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <h3 style={{ color: '#f1f5f9', margin: '0 0 4px 0', fontSize: '1.1rem' }}>{video.title}</h3>
                <p style={{ color: '#3b82f6', fontSize: '0.85rem', margin: '0 0 8px 0', fontWeight: '500' }}>
                  {video.authorNickname} • {video.viewsCount} просмотров
                </p>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0, lineHeight: '1.4' }}>
                  {video.description?.length > 150 
                    ? `${video.description.substring(0, 150)}...` 
                    : video.description}
                </p>
              </div>
              
              <ChevronRight size={20} color="#475569" />
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', color: '#64748b', marginTop: '100px' }}>
          <p>История пуста</p>
        </div>
      )}
    </div>
  );
};

// --- СТИЛИ ---

const historyCardStyle = {
  display: 'flex', 
  alignItems: 'center', 
  gap: '20px', 
  padding: '16px',
  backgroundColor: '#1e293b', 
  borderRadius: '12px', 
  cursor: 'pointer', 
  transition: 'background-color 0.2s ease',
  border: '1px solid #334155'
};

const thumbnailStyle = {
  width: '180px', 
  height: '100px', 
  backgroundColor: '#0f172a', 
  borderRadius: '8px',
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center', 
  flexShrink: 0,
  position: 'relative',
  overflow: 'hidden'
};

const playOverlayStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(0,0,0,0.3)',
  opacity: 0,
  transition: 'opacity 0.2s',
  '&:hover': {
    opacity: 1
  }
};

const centerTextStyle = { 
  color: 'white', 
  textAlign: 'center', 
  marginTop: '50px',
  fontSize: '1.1rem' 
};

export default HistoryPage;