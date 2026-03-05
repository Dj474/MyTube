import React, { useEffect, useState } from 'react';
import api from './api';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, Play, VideoOff, Image as ImageIcon, Trash2 } from 'lucide-react';

// --- Вспомогательный компонент для загрузки защищенных картинок ---
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

// --- Основной компонент страницы ---
const MyVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchVideos = async () => {
    try {
      const response = await api.get('/videos/my', {
        params: { page: 0, size: 20 }
      });
      const data = response.data.content || response.data;
      setVideos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Ошибка при получении видео:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleDelete = async (e, videoId) => {
    e.preventDefault(); // Останавливаем переход по ссылке при клике на удаление
    e.stopPropagation(); 
    if (window.confirm("Вы уверены, что хотите удалить это видео?")) {
      try {
        await api.delete(`/videos/${videoId}`);
        setVideos(videos.filter(v => v.id !== videoId));
      } catch (err) {
        alert("Не удалось удалить видео: " + (err.response?.data?.message || err.message));
      }
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', backgroundColor: '#0f172a' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div style={{ padding: '30px', maxWidth: '1300px', margin: '0 auto', color: '#f1f5f9' }}>
      {/* Шапка страницы */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '1px solid #334155', paddingBottom: '20px' }}>
        <div>
          <h1 style={{ color: '#3b82f6', margin: 0, fontSize: '1.8rem', fontWeight: 'bold' }}>Моя Студия</h1>
          <p style={{ color: '#94a3b8', marginTop: '5px' }}>Центр управления контентом</p>
        </div>
        <Link to="/upload" className="blue-btn" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', width: 'auto', padding: '12px 24px' }}>
          <PlusCircle size={20} /> Загрузить видео
        </Link>
      </header>

      {/* Сетка видео */}
      {videos.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' }}>
          {videos.map(video => (
            <div 
              key={video.id} 
              style={{ 
                background: '#1e293b', 
                borderRadius: '16px', 
                border: '1px solid #334155', 
                overflow: 'hidden', 
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Ссылка на плеер оборачивает основную область контента */}
              <Link to={`/video/${video.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                {/* Превью */}
                <div style={{ width: '100%', height: '180px', position: 'relative', background: '#000' }}>
                  <ProtectedThumbnail url={video.thumbnailUrl} />
                  
                  {/* Длительность */}
                  <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(0,0,0,0.8)', color: 'white', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    {video.duration || '0:00'}
                  </div>

                  {/* Оверлей при наведении (Play) */}
                  <div 
                    style={{ 
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        background: 'rgba(0,0,0,0.3)', opacity: 0, transition: '0.3s' 
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
                  >
                    <div style={{ background: '#3b82f6', borderRadius: '50%', padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)' }}>
                        <Play size={30} color="white" fill="white" />
                    </div>
                  </div>
                </div>

                {/* Инфо */}
                <div style={{ padding: '15px' }}>
                  <h3 style={{ margin: '0 0 10px 0', color: '#f1f5f9', fontSize: '1.05rem', fontWeight: '600', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {video.title}
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', height: '38px', overflow: 'hidden', marginBottom: '15px', lineHeight: '1.4' }}>
                    {video.description || "Нет описания"}
                  </p>
                </div>
              </Link>

              {/* Футер карточки (кнопка удаления вне ссылки) */}
              <div style={{ padding: '0 15px 15px 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#475569', fontWeight: '500' }}>ID: {video.id}</span>
                <button 
                  onClick={(e) => handleDelete(e, video.id)}
                  style={{ 
                    background: 'rgba(239, 68, 68, 0.1)', 
                    border: 'none', 
                    color: '#ef4444', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px', 
                    fontSize: '0.85rem',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    transition: '0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                >
                  <Trash2 size={16} /> Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '100px 20px', background: '#1e293b', borderRadius: '24px', border: '2px dashed #334155' }}>
          <VideoOff size={64} color="#475569" style={{ marginBottom: '20px' }} />
          <h2 style={{ color: '#f1f5f9', marginBottom: '10px' }}>Ваш видео-архив пуст</h2>
          <p style={{ color: '#94a3b8', marginBottom: '30px', fontSize: '1.1rem' }}>Пора поделиться чем-то крутым с миром!</p>
          <Link to="/upload" className="blue-btn" style={{ textDecoration: 'none', display: 'inline-block', width: 'auto' }}>
            Начать загрузку
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyVideos;