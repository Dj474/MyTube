import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Hls from 'hls.js';
import api from './api';
import { User, MessageSquare, ThumbsUp, Clock, Tag as TagIcon, ChevronLeft, Play } from 'lucide-react';

const VideoPlayerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  
  const [videoData, setVideoData] = useState(null);
  const [comments, setComments] = useState([]);
  const [recommendations, setRecommendations] = useState([]); // Состояние для рекомендаций
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Функция записи в историю (отправка события на бэкенд)
  const recordVideoView = async () => {
    try {
      // Отправляем ID видео. UserId бэкенд вытащит из заголовков/токена
      await api.post('/video/history', { videoId: id });
    } catch (err) {
      console.error("Ошибка при сохранении истории просмотра:", err);
    }
  };

  // 2. Загрузка данных видео и комментариев
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [videoRes, commentsRes] = await Promise.all([
          api.get(`/videos/${id}`),
          api.get(`/comments/${id}`, { params: { size: 50, sort: 'createdAt,desc' } }).catch(() => ({ data: { content: [] } }))
        ]);
        
        setVideoData(videoRes.data);
        setComments(commentsRes.data.content || []);
        
        // Сразу после загрузки данных видео — записываем просмотр
        recordVideoView();

      } catch (err) {
        setError("Не удалось загрузить видео.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  // 3. Загрузка рекомендаций (вызывается после того, как получили данные текущего видео)
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        // Эндпоинт твоего recommendation-service
        const res = await api.get('/video/recommendations', { params: { size: 6 } });
        setRecommendations(res.data.content || []);
      } catch (err) {
        console.warn("Рекомендации не удалось загрузить");
      }
    };

    if (videoData) {
      fetchRecommendations();
    }
  }, [id, videoData]);

  // Настройка HLS плеера
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
    return () => hlsRef.current?.destroy();
  }, [videoData]);

  const handleVideoLike = async () => {
    if (!videoData) return;
    const wasLiked = videoData.isLiked;
    
    setVideoData(prev => ({
      ...prev,
      isLiked: !wasLiked,
      amountOfLikes: wasLiked ? prev.amountOfLikes - 1 : prev.amountOfLikes + 1
    }));

    try {
      if (wasLiked) {
        await api.delete(`/videos/like/${id}`);
      } else {
        await api.post(`/videos/like/${id}`);
      }
    } catch (err) {
      setVideoData(prev => ({
        ...prev,
        isLiked: wasLiked,
        amountOfLikes: wasLiked ? prev.amountOfLikes + 1 : prev.amountOfLikes - 1
      }));
    }
  };

  const handleCommentLike = async (commentId) => {
    const targetComment = comments.find(c => c.id === commentId);
    if (!targetComment) return;
    const wasLiked = targetComment.isLiked;

    setComments(prev => prev.map(c => 
      c.id === commentId 
        ? { ...c, isLiked: !wasLiked, amountOfLikes: wasLiked ? c.amountOfLikes - 1 : c.amountOfLikes + 1 }
        : c
    ));

    try {
      if (wasLiked) {
        await api.delete(`/comments/like/${commentId}`);
      } else {
        await api.post(`/comments/like/${commentId}`);
      }
    } catch (err) {
      setComments(prev => prev.map(c => 
        c.id === commentId 
          ? { ...c, isLiked: wasLiked, amountOfLikes: wasLiked ? c.amountOfLikes + 1 : c.amountOfLikes - 1 }
          : c
      ));
    }
  };

  const handleSendComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const response = await api.post('/comments', { videoId: id, content: newComment, parentId: null });
      setComments((prev) => [response.data, ...prev]);
      setNewComment("");
    } catch (err) {
      alert("Ошибка отправки");
    }
  };

  if (loading) return <div style={centerStyle}>Загрузка...</div>;
  if (error) return <div style={centerStyle}>{error}</div>;

  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: '#f1f5f9', padding: '24px' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', gap: '30px', flexDirection: 'row', flexWrap: 'wrap' }}>
        
        {/* ЛЕВАЯ КОЛОНКА: ПЛЕЕР И ИНФО */}
        <div style={{ flex: '1 1 850px' }}>
          
          <button onClick={() => navigate(-1)} style={backButtonStyle}>
            <ChevronLeft size={20} /> Назад
          </button>

          <div style={playerContainerStyle}>
            <video ref={videoRef} controls playsInline style={{ width: '100%', height: '100%' }} />
          </div>

          <div style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
                {videoData?.title}
              </h1>
              
              <button onClick={handleVideoLike} style={{ ...likeButtonStyle, backgroundColor: videoData?.isLiked ? '#3b82f6' : '#1e293b', color: videoData?.isLiked ? 'white' : '#94a3b8' }}>
                <ThumbsUp size={20} fill={videoData?.isLiked ? "white" : "none"} />
                <span style={{ fontWeight: '600' }}>{videoData?.amountOfLikes || 0}</span>
              </button>
            </div>

            {videoData?.tags && videoData.tags.length > 0 && (
              <div style={tagContainerStyle}>
                {videoData.tags.map(tag => (
                  <span key={tag.id} style={tagChipStyle} onClick={() => navigate(`/search?tagId=${tag.id}`)}>
                    #{tag.displayName}
                  </span>
                ))}
              </div>
            )}

            <div style={descriptionBoxStyle}>
              <div style={metaRowStyle}>
                <Clock size={14} /> 
                <span>Опубликовано: {videoData?.createdAt ? new Date(videoData.createdAt).toLocaleDateString() : 'неизвестно'}</span>
                <span style={{ marginLeft: '10px', color: '#3b82f6' }}>@{videoData?.authorNickname || 'User_' + videoData?.userId}</span>
              </div>
              <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                {videoData?.description || "Описание отсутствует"}
              </p>
            </div>
          </div>

          {/* КОММЕНТАРИИ */}
          <div style={{ marginTop: '48px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.25rem' }}>
              <MessageSquare size={22} color="#3b82f6" /> 
              {comments.length} Комментариев
            </h3>

            <form onSubmit={handleSendComment} style={{ marginTop: '24px', display: 'flex', gap: '16px' }}>
              <div style={avatarStyle}><User size={20} /></div>
              <div style={{ flex: 1 }}>
                <textarea 
                   value={newComment} 
                   onChange={(e) => setNewComment(e.target.value)} 
                   placeholder="Написать комментарий..." 
                   style={textareaStyle} 
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                  <button disabled={!newComment.trim()} style={submitButtonStyle}>Отправить</button>
                </div>
              </div>
            </form>

            <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
              {comments.map((comment) => (
                <div key={comment.id} style={{ display: 'flex', gap: '16px' }}>
                  <div style={avatarSmallStyle}><User size={18} /></div>
                  <div style={{ flex: 1 }}>
                    <div style={commentMetaStyle}>
                      <span style={{ fontWeight: '600', color: '#f1f5f9' }}>User_{comment.userId}</span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{new Date(comment.createdAt).toLocaleString()}</span>
                    </div>
                    <p style={commentTextStyle}>{comment.content}</p>
                    
                    <button 
                      onClick={() => handleCommentLike(comment.id)}
                      style={{ ...commentLikeButtonStyle, color: comment.isLiked ? '#3b82f6' : '#94a3b8' }}
                    >
                      <ThumbsUp size={14} fill={comment.isLiked ? "#3b82f6" : "none"} />
                      <span>{comment.amountOfLikes || 0}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ПРАВАЯ КОЛОНКА: ДИНАМИЧЕСКИЕ РЕКОМЕНДАЦИИ */}
        <div style={{ flex: '1 1 350px' }}>
          <h4 style={{ color: '#94a3b8', marginBottom: '20px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
             Рекомендуем посмотреть
          </h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {recommendations.length > 0 ? (
              recommendations.map((rec) => (
                <div 
                  key={rec.id} 
                  onClick={() => navigate(`/video/${rec.id}`)}
                  style={recCardStyle}
                >
                  <div style={recThumbnailStyle}>
                    <Play size={20} color="white" opacity={0.5} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={recTitleStyle}>{rec.title}</div>
                    <div style={recMetaStyle}>@{rec.authorNickname || 'Автор'}</div>
                    <div style={recMetaStyle}>{rec.entityType === 'VIDEO' ? 'Видео' : 'Курс'}</div>
                  </div>
                </div>
              ))
            ) : (
              <div style={sidebarPlaceholderStyle}>
                <p>Здесь появятся видео, подобранные специально для вас</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

// --- СТИЛИ ---

const centerStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#0f172a', color: 'white' };
const backButtonStyle = { background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '16px', fontSize: '0.9rem' };
const playerContainerStyle = { width: '100%', background: '#000', borderRadius: '16px', overflow: 'hidden', aspectRatio: '16/9', border: '1px solid #334155', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' };
const likeButtonStyle = { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 20px', borderRadius: '24px', border: 'none', cursor: 'pointer', transition: '0.2s ease' };
const tagContainerStyle = { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' };
const tagChipStyle = { backgroundColor: '#1e293b', color: '#3b82f6', padding: '6px 14px', borderRadius: '18px', fontSize: '0.85rem', fontWeight: '600', border: '1px solid #334155', cursor: 'pointer', transition: '0.2s' };
const descriptionBoxStyle = { backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', marginTop: '20px', color: '#cbd5e1', border: '1px solid #334155' };
const metaRowStyle = { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '12px', borderBottom: '1px solid #334155', paddingBottom: '10px' };
const avatarStyle = { width: '44px', height: '44px', borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 };
const avatarSmallStyle = { width: '38px', height: '38px', borderRadius: '50%', background: '#1e293b', border: '1px solid #475569', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 };
const textareaStyle = { width: '100%', background: 'transparent', border: 'none', borderBottom: '2px solid #334155', color: 'white', outline: 'none', padding: '8px 0', resize: 'none', fontSize: '1rem' };
const submitButtonStyle = { background: '#3b82f6', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '24px', cursor: 'pointer', fontWeight: '700' };
const commentMetaStyle = { display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '6px' };
const commentTextStyle = { margin: '0 0 8px 0', fontSize: '1rem', color: '#cbd5e1', lineHeight: '1.4' };
const commentLikeButtonStyle = { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 0' };
const sidebarPlaceholderStyle = { padding: '40px 20px', border: '2px dashed #334155', borderRadius: '16px', textAlign: 'center', color: '#475569', fontSize: '0.9rem' };

// Стили карточек рекомендаций
const recCardStyle = { display: 'flex', gap: '12px', cursor: 'pointer', padding: '8px', borderRadius: '12px', transition: 'background 0.2s', backgroundColor: 'transparent' };
const recThumbnailStyle = { width: '140px', height: '80px', backgroundColor: '#1e293b', borderRadius: '8px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #334155' };
const recTitleStyle = { fontSize: '0.95rem', fontWeight: '600', color: '#f1f5f9', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.3' };
const recMetaStyle = { fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' };

export default VideoPlayerPage;