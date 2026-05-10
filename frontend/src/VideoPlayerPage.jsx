import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Hls from 'hls.js';
import api from './api';
import { 
  User, 
  MessageSquare, 
  ThumbsUp, 
  Clock, 
  ChevronLeft, 
  Film,
  Image as ImageIcon
} from 'lucide-react';

// --- Компонент для загрузки защищенных превью (как в RecommendationsPage) ---
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
      } catch (err) {
        console.error("Ошибка загрузки превью:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (url) fetchImage();
    else setLoading(false);

    return () => {
      isMounted = false;
      if (imageSrc) URL.revokeObjectURL(imageSrc);
    };
  }, [url]);

  if (loading) return <div style={{ width: '100%', height: '100%', background: '#1e293b' }} />;
  if (!imageSrc) return (
    <div style={{ width: '100%', height: '100%', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <ImageIcon size={24} color="#475569" />
    </div>
  );

  return <img src={imageSrc} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
};

// --- Основной компонент страницы плеера ---
const VideoPlayerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  
  const [videoData, setVideoData] = useState(null);
  const [comments, setComments] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Запись в историю
  const recordVideoView = async () => {
    try {
      await api.post('/videos/history', { videoId: id });
    } catch (err) {
      console.error("Ошибка при сохранении истории просмотра:", err);
    }
  };

  // 2. Основная загрузка данных видео и комментариев
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        setLoading(true);
        const [videoRes, commentsRes] = await Promise.all([
          api.get(`/videos/${id}`),
          api.get(`/comments/${id}`, { params: { size: 50, sort: 'createdAt,desc' } })
            .catch(() => ({ data: { content: [] } }))
        ]);
        
        if (isMounted) {
          setVideoData(videoRes.data);
          setComments(commentsRes.data.content || []);
          recordVideoView();
        }
      } catch (err) {
        if (isMounted) setError("Не удалось загрузить видео.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, [id]);

  // 3. Загрузка рекомендаций (логика "обогащения" данных как на странице рекомендаций)
  useEffect(() => {
    let isMounted = true;

    const fetchRecommendations = async () => {
      try {
        // Получаем список рекомендаций (обычно там только ID)
        const res = await api.get('/recommendation', { params: { page: 0, size: 10 } });
        const recIds = res.data.content || [];

        // Обогащаем каждый элемент, запрашивая полные данные видео
        const enrichedVideos = await Promise.all(
          recIds.map(async (item) => {
            try {
              // Важно: берем item.videoId, так как в ответе рекомендаций поле называется так
              const videoRes = await api.get(`/videos/${item.videoId || item.id}`);
              return videoRes.data;
            } catch (e) {
              return null;
            }
          })
        );

        if (isMounted) {
          setRecommendations(enrichedVideos.filter(v => v !== null));
        }
      } catch (err) {
        console.warn("Ошибка загрузки рекомендаций в сайдбаре:", err);
      }
    };

    if (videoData) {
      fetchRecommendations();
    }

    return () => { isMounted = false; };
  }, [id, videoData]);

  // 4. Настройка HLS
  useEffect(() => {
    if (!videoData || !videoRef.current) return;
    
    const hlsUrl = videoData.s3Key; 
    if (!hlsUrl) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        xhrSetup: (xhr) => {
          const token = localStorage.getItem('token');
          if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }
      });
      hls.loadSource(hlsUrl);
      hls.attachMedia(videoRef.current);
      hlsRef.current = hls;
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      videoRef.current.src = hlsUrl;
    }

    return () => {
      if (hlsRef.current) hlsRef.current.destroy();
    };
  }, [videoData]);

  // --- Хендлеры лайков и комментариев (без изменений) ---
  const handleVideoLike = async () => {
    if (!videoData) return;
    const wasLiked = videoData.isLiked;
    setVideoData(prev => ({
      ...prev,
      isLiked: !wasLiked,
      amountOfLikes: wasLiked ? prev.amountOfLikes - 1 : prev.amountOfLikes + 1
    }));
    try {
      if (wasLiked) await api.delete(`/videos/like/${id}`);
      else await api.post(`/videos/like/${id}`);
    } catch (err) { /* rollback logic */ }
  };

  const handleSendComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const response = await api.post('/comments', { videoId: id, content: newComment, parentId: null });
      setComments((prev) => [response.data, ...prev]);
      setNewComment("");
    } catch (err) { alert("Ошибка отправки комментария"); }
  };

  if (loading) return <div style={centerStyle}>Загрузка...</div>;
  if (error) return <div style={centerStyle}>{error}</div>;

  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: '#f1f5f9', padding: '24px' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', gap: '30px', flexDirection: 'row', flexWrap: 'wrap' }}>
        
        {/* ЛЕВАЯ КОЛОНКА */}
        <div style={{ flex: '1 1 850px' }}>
          <button onClick={() => navigate(-1)} style={backButtonStyle}>
            <ChevronLeft size={20} /> Назад
          </button>

          <div style={playerContainerStyle}>
            <video ref={videoRef} controls playsInline style={{ width: '100%', height: '100%' }} />
          </div>

          <div style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>{videoData?.title}</h1>
              <button onClick={handleVideoLike} style={{ ...likeButtonStyle, backgroundColor: videoData?.isLiked ? '#3b82f6' : '#1e293b' }}>
                <ThumbsUp size={20} fill={videoData?.isLiked ? "white" : "none"} />
                <span>{videoData?.amountOfLikes || 0}</span>
              </button>
            </div>

            <div style={descriptionBoxStyle}>
              <div style={metaRowStyle}>
                <Clock size={14} /> 
                <span>{new Date(videoData?.createdAt).toLocaleDateString()}</span>
                <span style={{ marginLeft: '10px', color: '#3b82f6' }}>@{videoData?.authorNickname}</span>
              </div>
              <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{videoData?.description}</p>
            </div>
          </div>

          {/* СЕКЦИЯ КОММЕНТАРИЕВ */}
          <div style={{ marginTop: '40px' }}>
             <h3 style={{ marginBottom: '20px' }}>{comments.length} Комментариев</h3>
             <form onSubmit={handleSendComment} style={{ display: 'flex', gap: '12px', marginBottom: '30px' }}>
                <textarea 
                  value={newComment} 
                  onChange={(e) => setNewComment(e.target.value)} 
                  placeholder="Добавить комментарий..." 
                  style={textareaStyle} 
                />
                <button style={submitButtonStyle}>Отправить</button>
             </form>
             {/* Список комментариев... */}
          </div>
        </div>

        {/* ПРАВАЯ КОЛОНКА (САЙДБАР РЕКОМЕНДАЦИЙ) */}
        <div style={{ flex: '1 1 350px' }}>
          <h4 style={{ color: '#94a3b8', marginBottom: '20px' }}>Рекомендуем</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {recommendations.map((rec) => (
              <div 
                key={rec.id} 
                onClick={() => navigate(`/video/${rec.id}`)}
                style={recCardStyle}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1e293b'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div style={recThumbnailWrapper}>
                  {/* ИСПОЛЬЗУЕМ ТОТ ЖЕ КОМПОНЕНТ ЧТО И НА СТРАНИЦЕ РЕКОМЕНДАЦИЙ */}
                  <ProtectedThumbnail url={rec.thumbnailUrl} />
                </div>
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h5 style={recTitleStyle}>{rec.title}</h5>
                  <p style={recAuthorStyle}>{rec.authorNickname}</p>
                  <p style={recAuthorStyle}>{rec.amountOfViews || 0} просмотров</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

// --- СТИЛИ ---
const centerStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' };
const backButtonStyle = { background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '16px' };
const playerContainerStyle = { width: '100%', aspectRatio: '16/9', background: 'black', borderRadius: '12px', overflow: 'hidden' };
const likeButtonStyle = { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '20px', border: 'none', color: 'white', cursor: 'pointer' };
const descriptionBoxStyle = { background: '#1e293b', padding: '16px', borderRadius: '12px', marginTop: '16px' };
const metaRowStyle = { display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.9rem', marginBottom: '8px' };
const textareaStyle = { flex: 1, background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: 'white', padding: '12px', resize: 'none' };
const submitButtonStyle = { background: '#3b82f6', border: 'none', color: 'white', padding: '0 20px', borderRadius: '8px', cursor: 'pointer' };

const recCardStyle = { display: 'flex', gap: '12px', cursor: 'pointer', padding: '8px', borderRadius: '8px', transition: '0.2s' };
const recThumbnailWrapper = { width: '140px', height: '80px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 };
const recTitleStyle = { color: 'white', fontSize: '0.9rem', margin: '0 0 4px 0', fontWeight: '600', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' };
const recAuthorStyle = { color: '#94a3b8', fontSize: '0.8rem', margin: 0 };

export default VideoPlayerPage;