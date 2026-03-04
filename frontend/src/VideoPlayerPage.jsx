import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import Hls from 'hls.js';
import api from './api';
import { User, MessageSquare, ThumbsUp, AlertCircle, Clock } from 'lucide-react';

const VideoPlayerPage = () => {
  const { id } = useParams();
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  
  const [videoData, setVideoData] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      } catch (err) {
        setError("Не удалось загрузить видео.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

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

  // --- ЛОГИКА ЛАЙКА ВИДЕО ---
  const handleVideoLike = async () => {
    if (!videoData) return;
    const wasLiked = videoData.isLiked;
    
    // Оптимистичное обновление
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
      // Откат при ошибке
      setVideoData(prev => ({
        ...prev,
        isLiked: wasLiked,
        amountOfLikes: wasLiked ? prev.amountOfLikes + 1 : prev.amountOfLikes - 1
      }));
    }
  };

  // --- ЛОГИКА ЛАЙКА КОММЕНТАРИЯ ---
  const handleCommentLike = async (commentId) => {
    const targetComment = comments.find(c => c.id === commentId);
    if (!targetComment) return;

    const wasLiked = targetComment.isLiked;

    // Оптимистичное обновление списка комментариев
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
      // Откат при ошибке
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

  if (loading) return <div className="loading-screen">Загрузка...</div>;
  if (error) return <div className="error-screen">{error}</div>;

  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: '#f1f5f9', padding: '24px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', gap: '30px' }}>
        
        <div style={{ flex: 2.5 }}>
          {/* Плеер */}
          <div style={{ width: '100%', background: '#000', borderRadius: '16px', overflow: 'hidden', aspectRatio: '16/9', border: '1px solid #334155' }}>
            <video ref={videoRef} controls playsInline style={{ width: '100%', height: '100%' }} />
          </div>

          {/* Заголовок и Кнопка лайка видео */}
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 'bold', margin: 0 }}>{videoData?.title}</h1>
              
              <button 
                onClick={handleVideoLike}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px',
                  borderRadius: '20px', border: 'none', cursor: 'pointer',
                  backgroundColor: videoData?.isLiked ? '#3b82f6' : '#1e293b',
                  color: videoData?.isLiked ? 'white' : '#94a3b8',
                  transition: '0.3s'
                }}
              >
                <ThumbsUp size={18} fill={videoData?.isLiked ? "white" : "none"} />
                <span>{videoData?.amountOfLikes || 0}</span>
              </button>
            </div>

            <div style={{ backgroundColor: '#1e293b', padding: '15px', borderRadius: '12px', marginTop: '15px', color: '#cbd5e1' }}>
              {videoData?.description || "Описание отсутствует"}
            </div>
          </div>

          {/* КОММЕНТАРИИ */}
          <div style={{ marginTop: '40px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><MessageSquare size={20} /> Комментарии</h3>

            <form onSubmit={handleSendComment} style={{ marginTop: '20px', display: 'flex', gap: '15px' }}>
              <div style={avatarStyle}><User size={20} /></div>
              <div style={{ flex: 1 }}>
                <textarea 
                   value={newComment} 
                   onChange={(e) => setNewComment(e.target.value)} 
                   placeholder="Написать комментарий..." 
                   style={textareaStyle} 
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button disabled={!newComment.trim()} style={submitButtonStyle}>Отправить</button>
                </div>
              </div>
            </form>

            <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '25px' }}>
              {comments.map((comment) => (
                <div key={comment.id} style={{ display: 'flex', gap: '15px' }}>
                  <div style={avatarSmallStyle}><User size={18} /></div>
                  <div style={{ flex: 1 }}>
                    <div style={commentMetaStyle}>
                      <span style={{ fontWeight: 'bold' }}>User_{comment.userId}</span>
                      <span style={{ fontSize: '0.75rem' }}>{new Date(comment.createdAt).toLocaleString()}</span>
                    </div>
                    <p style={commentTextStyle}>{comment.content}</p>
                    
                    {/* Кнопка лайка комментария */}
                    <button 
                      onClick={() => handleCommentLike(comment.id)}
                      style={{ 
                        background: 'none', border: 'none', cursor: 'pointer', display: 'flex', 
                        alignItems: 'center', gap: '5px', padding: '5px 0',
                        color: comment.isLiked ? '#3b82f6' : '#94a3b8' 
                      }}
                    >
                      <ThumbsUp size={14} fill={comment.isLiked ? "#3b82f6" : "none"} />
                      <span style={{ fontSize: '0.8rem' }}>{comment.amountOfLikes || 0}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Сайдбар */}
        <div style={{ flex: 1 }}>
          <h4 style={{ color: '#94a3b8', marginBottom: '15px' }}>Следующие видео</h4>
          <div style={sidebarPlaceholderStyle}>Скоро здесь будут рекомендации</div>
        </div>

      </div>
    </div>
  );
};

// Стили в объектах для чистоты
const avatarStyle = { width: '40px', height: '40px', borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 };
const avatarSmallStyle = { width: '36px', height: '36px', borderRadius: '50%', background: '#1e293b', border: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 };
const textareaStyle = { width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid #334155', color: 'white', outline: 'none', padding: '5px 0', resize: 'none' };
const submitButtonStyle = { background: '#3b82f6', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '20px', cursor: 'pointer', fontWeight: '600' };
const commentMetaStyle = { display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '4px', color: '#64748b' };
const commentTextStyle = { margin: 0, fontSize: '0.95rem', color: '#cbd5e1' };
const sidebarPlaceholderStyle = { padding: '20px', border: '1px dashed #334155', borderRadius: '12px', textAlign: 'center', color: '#475569' };

export default VideoPlayerPage;