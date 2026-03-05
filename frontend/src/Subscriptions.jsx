import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';
import { Users, PlayCircle, User, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

/**
 * Универсальный компонент для загрузки защищенных изображений (Thumbnail и Avatar)
 */
const SecureThumbnail = ({ url, title, isAvatar = false }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let objectUrl = null;

    const fetchImage = async () => {
      if (!url) return;
      try {
        const response = await api.get(url, { responseType: 'blob' });
        objectUrl = URL.createObjectURL(response.data);
        setImageSrc(objectUrl);
      } catch (err) {
        console.error("Ошибка загрузки изображения:", err);
        setError(true);
      }
    };

    fetchImage();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url]);

  // Если ошибка или нет URL, показываем иконку-заглушку
  if (error || !url) {
    return (
      <div style={isAvatar ? avatarPlaceholderStyle : placeholderStyle}>
        {isAvatar ? (
          <User size={35} color="#475569" />
        ) : (
          <PlayCircle size={48} color="#3b82f6" style={{ opacity: 0.6 }} />
        )}
      </div>
    );
  }

  if (!imageSrc) {
    return <div style={isAvatar ? avatarPlaceholderStyle : placeholderStyle} />;
  }

  return (
    <img 
      src={imageSrc} 
      alt={title} 
      style={isAvatar ? avatarImageStyle : imageStyle} 
    />
  );
};

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [subsRes, videosRes] = await Promise.all([
          api.get('/subscription'),
          api.get('/videos/subscription', { params: { size: 12 } }).catch(() => ({ data: { content: [] } }))
        ]);

        setSubscriptions(subsRes.data.content || []);
        setVideos(videosRes.data.content || []);
      } catch (err) {
        console.error("Ошибка загрузки данных:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.8;
      scrollRef.current.scrollBy({ 
        left: direction === 'left' ? -scrollAmount : scrollAmount, 
        behavior: 'smooth' 
      });
    }
  };

  if (loading) return <div style={{ color: 'white', padding: '20px' }}>Загрузка...</div>;

  return (
    <div style={{ padding: '30px', backgroundColor: '#0f172a', minHeight: '100vh', color: '#f1f5f9' }}>
      
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.8rem', marginBottom: '25px' }}>
        <Users size={32} color="#3b82f6" /> Мои подписки
      </h1>

      {subscriptions.length > 0 ? (
        <div 
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{ position: 'relative', display: 'flex', alignItems: 'center', marginBottom: '40px' }}
        >
          <button 
            onClick={() => scroll('left')} 
            style={{ ...arrowButtonStyle, left: '-10px', opacity: isHovered ? 1 : 0 }}
          >
            <ChevronLeft size={24} />
          </button>

          <div 
            ref={scrollRef} 
            className="hide-scrollbar"
            style={{ display: 'flex', gap: '25px', overflowX: 'auto', width: '100%', padding: '10px 5px' }}
          >
            {subscriptions.map((sub) => (
              <div 
                key={sub.authorId} 
                onClick={() => navigate(`/profile/${sub.authorId}`)}
                style={authorCardStyle}
              >
                <div style={circleStyle}>
                  {/* Теперь здесь загружается реальное фото автора */}
                  <SecureThumbnail 
                    url={sub.photoUrl} 
                    title={sub.nickname} 
                    isAvatar={true} 
                  />
                </div>
                <span style={nicknameStyle}>{sub.nickname}</span>
              </div>
            ))}
          </div>

          <button 
            onClick={() => scroll('right')} 
            style={{ ...arrowButtonStyle, right: '-10px', opacity: isHovered ? 1 : 0 }}
          >
            <ChevronRight size={24} />
          </button>
        </div>
      ) : (
        <p style={{ color: '#64748b', marginBottom: '40px' }}>Список подписок пуст.</p>
      )}

      <h2 style={{ fontSize: '1.4rem', marginBottom: '20px', color: '#94a3b8' }}>Свежие видео</h2>
      
      <div style={videoGridStyle}>
        {videos.map((video) => (
          <div 
            key={video.id} 
            onClick={() => navigate(`/video/${video.id}`)}
            style={videoCardStyle}
          >
            <div style={thumbnailContainerStyle}>
              <SecureThumbnail url={video.thumbnailUrl} title={video.title} />
            </div>

            <div style={{ padding: '15px' }}>
              <h3 style={videoTitleStyle}>{video.title}</h3>
              <div style={videoInfoRowStyle}>
                <span style={{ color: '#3b82f6', fontWeight: '500' }}>@{video.authorNickname || 'Автор'}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={12} />
                  <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
};

// --- ДОПОЛНЕННЫЕ СТИЛИ ---

const circleStyle = {
  width: '75px', height: '75px', borderRadius: '50%', background: '#1e293b', 
  border: '2px solid #334155', overflow: 'hidden', // Чтобы картинка не вылезала за границы круга
  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px'
};

const avatarImageStyle = {
  width: '100%', height: '100%', objectFit: 'cover'
};

const avatarPlaceholderStyle = {
  width: '100%', height: '100%', background: '#1e293b',
  display: 'flex', alignItems: 'center', justifyContent: 'center'
};

// Оставляем остальные стили без изменений...
const authorCardStyle = { display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', flexShrink: 0, width: '85px', transition: 'transform 0.2s' };
const nicknameStyle = { fontSize: '0.85rem', color: '#cbd5e1', textAlign: 'center', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
const videoGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' };
const videoCardStyle = { background: '#1e293b', borderRadius: '15px', overflow: 'hidden', cursor: 'pointer', border: '1px solid #334155', transition: 'transform 0.2s' };
const thumbnailContainerStyle = { width: '100%', aspectRatio: '16/9', background: '#000', overflow: 'hidden' };
const imageStyle = { width: '100%', height: '100%', objectFit: 'cover' };
const placeholderStyle = { width: '100%', height: '100%', background: 'linear-gradient(45deg, #0f172a, #1e3a8a)', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const videoTitleStyle = { fontSize: '1.05rem', margin: 0, color: '#f1f5f9', fontWeight: '600', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' };
const videoInfoRowStyle = { display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '0.85rem', color: '#94a3b8' };
const arrowButtonStyle = { position: 'absolute', zIndex: 10, background: '#3b82f6', border: 'none', color: 'white', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.3s ease', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' };

export default Subscriptions;