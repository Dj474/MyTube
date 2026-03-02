import React, { useEffect, useState } from 'react';
import api from './api'; // Используем твой настроенный конфиг с интерцепторами
import { Link } from 'react-router-dom';
import { PlusCircle, Play, VideoOff, Image as ImageIcon, Trash2 } from 'lucide-react';

// --- Вспомогательный компонент для загрузки защищенных картинок ---
const ProtectedThumbnail = ({ url }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        // api сам подставит токен и обновит его если надо
        const response = await api.get(url, {
          responseType: 'blob' 
        });
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

  if (loading) return <div style={{ width: '100%', height: '100%', background: '#f8fafc' }} />;
  if (!imageSrc) return (
    <div style={{ width: '100%', height: '100%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <ImageIcon size={40} color="#cbd5e1" />
    </div>
  );

  return <img src={imageSrc} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
};

// --- Основной компонент страницы ---
const MyVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Функция загрузки данных
  const fetchVideos = async () => {
    try {
      // Здесь не нужно вручную писать headers, api.js сделает это за нас
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

  // Функция удаления видео
  const handleDelete = async (videoId) => {
    if (window.confirm("Вы уверены, что хотите удалить это видео?")) {
      try {
        await api.delete(`/videos/${videoId}`);
        // Обновляем список локально, чтобы видео исчезло сразу
        setVideos(videos.filter(v => v.id !== videoId));
      } catch (err) {
        alert("Не удалось удалить видео: " + (err.response?.data?.message || err.message));
      }
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <div className="spinner" style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #2563eb', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      {/* Шапка страницы */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px' }}>
        <div>
          <h1 style={{ color: '#1e3a8a', margin: 0, fontSize: '1.8rem' }}>Моя Студия</h1>
          <p style={{ color: '#64748b', marginTop: '5px' }}>Управляйте своим контентом</p>
        </div>
        <Link to="/upload" className="blue-btn" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', width: 'auto', padding: '12px 24px' }}>
          <PlusCircle size={20} /> Загрузить видео
        </Link>
      </header>

      {/* Сетка видео */}
      {videos.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' }}>
          {videos.map(video => (
            <div key={video.id} style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', transition: 'transform 0.2s' }}
                 onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                 onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              
              {/* Превью видео */}
              <div style={{ width: '100%', height: '170px', position: 'relative', background: '#000' }}>
                <ProtectedThumbnail url={video.thumbnailUrl} />
                <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>
                  {video.duration || '0:00'}
                </div>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: '0.3s', cursor: 'pointer' }}
                     className="play-overlay" onMouseEnter={(e) => e.currentTarget.style.opacity = 1} onMouseLeave={(e) => e.currentTarget.style.opacity = 0}>
                  <Play size={44} color="white" fill="white" />
                </div>
              </div>

              {/* Инфо видео */}
              <div style={{ padding: '15px' }}>
                <h3 style={{ margin: '0 0 8px 0', color: '#1e3a8a', fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {video.title}
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.85rem', height: '38px', overflow: 'hidden', marginBottom: '15px' }}>
                  {video.description || "Нет описания"}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ID: {video.id}</span>
                  <button 
                    onClick={() => handleDelete(video.id)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}
                  >
                    <Trash2 size={16} /> Удалить
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 20px', background: '#f8fafc', borderRadius: '16px', border: '2px dashed #cbd5e1' }}>
          <VideoOff size={60} color="#94a3b8" style={{ marginBottom: '20px' }} />
          <h2 style={{ color: '#475569', marginBottom: '10px' }}>Здесь пока пусто</h2>
          <p style={{ color: '#94a3b8', marginBottom: '30px' }}>Загрузите свое первое видео прямо сейчас!</p>
          <Link to="/upload" className="blue-btn" style={{ textDecoration: 'none', display: 'inline-block', width: 'auto' }}>
            Начать загрузку
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyVideos;