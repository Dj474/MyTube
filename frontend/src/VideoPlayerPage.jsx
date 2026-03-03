import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import Hls from 'hls.js';
import api from './api';
import { User, MessageSquare, Send, ThumbsUp, AlertCircle } from 'lucide-react';

const VideoPlayerPage = () => {
  const { id } = useParams(); // UUID видео
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  
  const [videoData, setVideoData] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- 1. ЗАГРУЗКА ДАННЫХ (Видео и Комментарии) ---
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Параллельно загружаем инфо о видео и первую страницу комментариев
        const [videoRes, commentsRes] = await Promise.all([
          api.get(`/videos/${id}`),
          api.get(`/comments/${id}`, { params: { size: 50, sort: 'createdAt,desc' } }).catch(err => {
            console.error("Ошибка при загрузке комментариев:", err);
            return { data: { content: [] } }; // Возвращаем пустой список, если комментарии упали
          })
        ]);

        setVideoData(videoRes.data);
        setComments(commentsRes.data.content || []);
      } catch (err) {
        console.error("Ошибка загрузки данных страницы:", err);
        setError("Не удалось загрузить видео. Возможно, оно было удалено.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  // --- 2. ИНИЦИАЛИЗАЦИЯ ПЛЕЕРА (Только когда загружен videoData) ---
  useEffect(() => {
    // Если данных еще нет или видео-элемент не отрисован — выходим
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

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        // Пытаемся запустить, игнорируя ошибку автоплея (браузеры иногда блокируют со звуком)
        videoRef.current.play().catch(() => console.log("Автозапуск заблокирован"));
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.error("Критическая ошибка HLS:", data);
        }
      });

      return () => {
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }
      };
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      // Для Safari нативная поддержка
      videoRef.current.src = hlsUrl;
    }
  }, [videoData]); // Эффект перезапустится только если изменится объект видео

  // --- 3. ОТПРАВКА КОММЕНТАРИЯ ---
  const handleSendComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      // Соответствует твоей CommentDtoIn (content, videoId, parentId)
      const commentDtoIn = {
        videoId: id,
        content: newComment,
        parentId: null
      };

      const response = await api.post('/comments', commentDtoIn);
      
      // Добавляем результат (CommentDtoOut) в начало списка
      setComments((prev) => [response.data, ...prev]);
      setNewComment("");
    } catch (err) {
      alert("Ошибка при отправке: " + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a' }}>
      <div className="spinner"></div>
    </div>
  );

  if (error) return (
    <div style={{ color: 'white', textAlign: 'center', padding: '50px', background: '#0f172a', minHeight: '100vh' }}>
      <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '20px' }} />
      <p>{error}</p>
    </div>
  );

  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: '#f1f5f9', padding: '24px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', gap: '30px' }}>
        
        {/* ЛЕВАЯ ЧАСТЬ (Плеер и Комменты) */}
        <div style={{ flex: 2.5 }}>
          {/* Контейнер видео */}
          <div style={{ width: '100%', background: '#000', borderRadius: '16px', overflow: 'hidden', aspectRatio: '16/9', border: '1px solid #334155' }}>
            <video 
              ref={videoRef} 
              controls 
              playsInline
              style={{ width: '100%', height: '100%' }} 
            />
          </div>

          {/* Информация */}
          <div style={{ marginTop: '20px' }}>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{videoData?.title}</h1>
            <div style={{ backgroundColor: '#1e293b', padding: '15px', borderRadius: '12px', marginTop: '15px', color: '#cbd5e1' }}>
              {videoData?.description || "Описание отсутствует"}
            </div>
          </div>

          {/* КОММЕНТАРИИ */}
          <div style={{ marginTop: '40px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem' }}>
              <MessageSquare size={20} color="#3b82f6" />
              Комментарии ({comments.length})
            </h3>

            {/* Форма */}
            <form onSubmit={handleSendComment} style={{ marginTop: '20px', display: 'flex', gap: '15px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <User size={20} color="white" />
              </div>
              <div style={{ flex: 1 }}>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Добавьте комментарий..."
                  style={{
                    width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid #334155',
                    color: 'white', outline: 'none', padding: '5px 0', resize: 'none', transition: '0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderBottomColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderBottomColor = '#334155'}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button 
                    disabled={!newComment.trim()}
                    style={{ 
                      background: '#3b82f6', color: 'white', border: 'none', padding: '8px 20px', 
                      borderRadius: '20px', cursor: 'pointer', fontWeight: '600',
                      opacity: newComment.trim() ? 1 : 0.5 
                    }}
                  >
                    Отправить
                  </button>
                </div>
              </div>
            </form>

            {/* Список */}
            <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '25px' }}>
              {comments.map((comment) => (
                <div key={comment.id} style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#1e293b', border: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <User size={18} color="#94a3b8" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>User_{comment.userId}</span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{comment.createdAt}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.95rem', color: '#cbd5e1', lineHeight: '1.5' }}>
                      {comment.content}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '8px' }}>
                      <button style={{ background: 'none', border: 'none', color: comment.isLiked ? '#3b82f6' : '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', padding: 0 }}>
                        <ThumbsUp size={14} />
                        <span style={{ fontSize: '0.8rem' }}>{comment.amountOfLikes || 0}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {comments.length === 0 && <p style={{ color: '#475569', textAlign: 'center' }}>Пока никто не оставил комментарий.</p>}
            </div>
          </div>
        </div>

        {/* ПРАВАЯ ЧАСТЬ (Сайдбар) */}
        <div style={{ flex: 1 }}>
          <h4 style={{ color: '#94a3b8', marginBottom: '15px', fontSize: '1rem' }}>Следующие видео</h4>
          <div style={{ padding: '20px', border: '1px dashed #334155', borderRadius: '12px', textAlign: 'center', color: '#475569' }}>
            Скоро здесь будет список рекомендаций
          </div>
        </div>

      </div>
    </div>
  );
};

export default VideoPlayerPage;