import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Hls from 'hls.js';
import api from './api';
import { 
  ThumbsUp, Clock, ChevronLeft, PlusCircle, X, 
  ListMusic, User, Heart, PlayCircle, Flag, AlertTriangle, Send 
} from 'lucide-react';

// --- КОМПОНЕНТ АВТОРА ---
const AuthorProfile = ({ userId, size = "40px", showNickname = true }) => {
  const [profile, setProfile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const fetchAuthorData = async () => {
      if (!userId || userId === "undefined") return;
      try {
        const res = await api.get(`/profile/${userId}`);
        if (!isMounted) return;
        setProfile(res.data);
        const photoPath = res.data.photoUrl || res.data.avatarUrl;
        if (photoPath) {
          const imgRes = await api.get(photoPath, { responseType: 'blob' });
          if (isMounted) {
            const objectUrl = URL.createObjectURL(imgRes.data);
            setAvatarUrl(objectUrl);
          }
        }
      } catch (err) {
        console.warn("Не удалось загрузить данные автора:", userId);
      }
    };
    fetchAuthorData();
    return () => {
      isMounted = false;
      if (avatarUrl) URL.revokeObjectURL(avatarUrl);
    };
  }, [userId]);

  return (
    <div 
      onClick={(e) => { e.stopPropagation(); navigate(`/profile/${userId}`); }} 
      style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
    >
      <div style={{ 
        width: size, height: size, borderRadius: '50%', overflow: 'hidden', 
        backgroundColor: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        border: '1px solid #475569'
      }}>
        {avatarUrl ? (
          <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <User size={parseInt(size) * 0.5} color="#94a3b8" />
        )}
      </div>
      {showNickname && (
        <span style={{ fontWeight: '700', color: '#f8fafc', fontSize: '0.95rem' }}>
          {profile?.nickname || profile?.firstName || '...'}
        </span>
      )}
    </div>
  );
};

// --- ВСПОМОГАТЕЛЬНЫЙ КОМПОНЕНТ ДЛЯ ИЗОБРАЖЕНИЙ ---
const SecureImage = ({ path, style, alt = "" }) => {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    let isMounted = true;
    if (!path) return;
    api.get(path, { responseType: 'blob' })
      .then(res => {
        if (isMounted) setUrl(URL.createObjectURL(res.data));
      })
      .catch(() => {});
    return () => { isMounted = false; if (url) URL.revokeObjectURL(url); };
  }, [path]);

  if (!url) return <div style={{ ...style, background: '#1e293b' }} />;
  return <img src={url} alt={alt} style={{ ...style, objectFit: 'cover' }} />;
};

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
  const [playlists, setPlaylists] = useState([]);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);

  // Состояния для модалки жалоб
  const [reportModal, setReportModal] = useState({ isOpen: false, type: null, targetId: null });
  const [reportForm, setReportForm] = useState({ reason: 'SPAM', description: '' });

  const formatDate = (d) => {
    if (!d) return "";
    const date = Array.isArray(d) ? new Date(d[0], d[1]-1, d[2]) : new Date(d);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  useEffect(() => {
    const loadPage = async () => {
      try {
        setLoading(true);
        const [vRes, cRes, recRes] = await Promise.all([
          api.get(`/videos/${id}`),
          api.get(`/comments/${id}`, { params: { size: 50, sort: 'createdAt,desc' } }).catch(() => ({ data: { content: [] } })),
          api.get(`/videos`, { params: { size: 10 } }).catch(() => ({ data: { content: [] } }))
        ]);
        
        setVideoData(vRes.data);
        setComments(cRes.data.content || []);
        setRecommendations(recRes.data.content?.filter(v => v.id !== id) || []);
        api.post('/videos/history', { videoId: id }).catch(() => {});
      } catch (err) {
        console.error("Ошибка загрузки:", err);
      } finally {
        setLoading(false);
      }
    };
    loadPage();
  }, [id]);

  useEffect(() => {
    if (!videoData?.s3Key || !videoRef.current) return;
    if (Hls.isSupported()) {
      const hls = new Hls({
        xhrSetup: (xhr) => {
          const token = localStorage.getItem('token');
          if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }
      });
      hls.loadSource(videoData.s3Key);
      hls.attachMedia(videoRef.current);
      hlsRef.current = hls;
    }
    return () => hlsRef.current?.destroy();
  }, [videoData]);

  const handleLikeVideo = async () => {
    const active = videoData.isLiked;
    setVideoData(prev => ({ 
      ...prev, isLiked: !active, 
      amountOfLikes: active ? prev.amountOfLikes - 1 : prev.amountOfLikes + 1 
    }));
    try { active ? await api.delete(`/videos/like/${id}`) : await api.post(`/videos/like/${id}`); } catch {}
  };

  const handleSendComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await api.post('/comments', { videoId: id, content: newComment });
      setComments(prev => [res.data, ...prev]);
      setNewComment("");
    } catch { alert("Ошибка отправки"); }
  };

  const handleLikeComment = async (commentId) => {
    setComments(prev => prev.map(c => {
      if (c.id === commentId) {
        const active = c.isLiked;
        return { 
          ...c, 
          isLiked: !active, 
          amountOfLikes: active ? c.amountOfLikes - 1 : c.amountOfLikes + 1 
        };
      }
      return c;
    }));
    try {
      const target = comments.find(c => c.id === commentId);
      target.isLiked ? await api.delete(`/comments/like/${commentId}`) : await api.post(`/comments/like/${commentId}`);
    } catch {}
  };

  const submitReport = async () => {
    try {
      const endpoint = reportModal.type === 'video' 
        ? `/videos/report/${id}` 
        : `/comments/report/${reportModal.targetId}`;
      
      await api.post(endpoint, reportForm);
      alert("Жалоба успешно отправлена");
      setReportModal({ isOpen: false, type: null, targetId: null });
      setReportForm({ reason: 'SPAM', description: '' });
    } catch (err) {
      alert(err.response?.data?.message || "Ошибка при отправке жалобы");
    }
  };

  if (loading) return <div style={centerStyle}>Загрузка...</div>;

  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: '#f1f5f9', padding: '20px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        <button onClick={() => navigate(-1)} style={backButtonStyle}>
          <ChevronLeft size={20} /> Назад
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '40px' }}>
          
          <div>
            <div style={playerWrapper}>
              <video ref={videoRef} controls style={{ width: '100%', height: '100%' }} />
            </div>
            
            <h1 style={{ fontSize: '1.6rem', margin: '24px 0 16px 0' }}>{videoData?.title}</h1>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <AuthorProfile userId={videoData?.userId} size="50px" />
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => setReportModal({ isOpen: true, type: 'video', targetId: id })} 
                  style={{ ...actionBtn, color: '#f87171' }} 
                >
                  <Flag size={18}/>
                </button>
                <button onClick={() => {
                  api.get('/videos/playlist/my').then(r => setPlaylists(r.data.content));
                  setIsPlaylistModalOpen(true);
                }} style={actionBtn}>
                  <PlusCircle size={18}/> Сохранить
                </button>
                <button onClick={handleLikeVideo} style={{ ...actionBtn, background: videoData?.isLiked ? '#3b82f6' : '#1e293b' }}>
                  <ThumbsUp size={18} fill={videoData?.isLiked ? "white" : "none"} /> {videoData?.amountOfLikes}
                </button>
              </div>
            </div>

            <div style={descriptionBox}>
              <div style={metaDate}><Clock size={14}/> {formatDate(videoData?.date)}</div>
              <p style={{ lineHeight: '1.6', color: '#cbd5e1' }}>{videoData?.description}</p>
            </div>

            <div style={{ marginTop: '40px' }}>
              <h3 style={{ marginBottom: '20px' }}>Комментарии ({comments.length})</h3>
              
              <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
                <textarea 
                  style={textareaStyle} 
                  value={newComment} 
                  onChange={e => setNewComment(e.target.value)} 
                  placeholder="Оставьте комментарий..." 
                />
                <button onClick={handleSendComment} style={submitBtn}>Отправить</button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {comments.map(c => (
                  <div key={c.id} style={{ borderBottom: '1px solid #1e293b', paddingBottom: '20px' }}>
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                      <AuthorProfile userId={c.userId} size="40px" />
                      <div style={{ flex: 1, paddingTop: '4px' }}>
                        <div style={{ color: '#e2e8f0', fontSize: '0.95rem', lineHeight: '1.5' }}>
                          {c.content}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '10px' }}>
                          <button 
                            onClick={() => handleLikeComment(c.id)} 
                            style={{ ...iconBtn, color: c.isLiked ? '#f87171' : '#64748b' }}
                          >
                            <Heart size={14} fill={c.isLiked ? "#f87171" : "none"} /> 
                            <span style={{ fontSize: '0.85rem' }}>{c.amountOfLikes || 0}</span>
                          </button>
                          <button 
                            onClick={() => setReportModal({ isOpen: true, type: 'comment', targetId: c.id })} 
                            style={commentReportBtn}
                          >
                            <AlertTriangle size={14} /> <span style={{ fontSize: '0.8rem' }}>Пожаловаться</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h3 style={{ marginBottom: '20px', fontSize: '1.1rem' }}>Похожие видео</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {recommendations.map(v => (
                <div key={v.id} onClick={() => navigate(`/video/${v.id}`)} style={recCard}>
                  <SecureImage path={v.thumbnailUrl} style={recImg} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={recTitle}>{v.title}</div>
                    <div style={recDesc}>{v.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isPlaylistModalOpen && (
        <div style={modalOverlay} onClick={() => setIsPlaylistModalOpen(false)}>
          <div style={modalContent} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>Добавить в плейлист</h3>
              <X cursor="pointer" onClick={() => setIsPlaylistModalOpen(false)} />
            </div>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {playlists.map(pl => (
                <div key={pl.id} style={playlistRow} onClick={() => {
                  api.post(`/videos/playlist/${pl.id}/videos/${id}`).then(() => setIsPlaylistModalOpen(false));
                }}>
                  <ListMusic size={18} color="#3b82f6" /> {pl.title}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {reportModal.isOpen && (
        <div style={modalOverlay} onClick={() => setReportModal({ isOpen: false, type: null, targetId: null })}>
          <div style={modalContent} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>Пожаловаться</h3>
              <X cursor="pointer" onClick={() => setReportModal({ isOpen: false, type: null, targetId: null })} />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={labelStyle}>Причина</label>
              <select 
                style={selectStyle}
                value={reportForm.reason}
                onChange={e => setReportForm({...reportForm, reason: e.target.value})}
              >
                <option value="SPAM">Спам</option>
                <option value="HARASSMENT">Оскорбление</option>
                <option value="VIOLENCE">Насилие</option>
                <option value="COPYRIGHT">Авторские права</option>
                <option value="OTHER">Другое</option>
              </select>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Описание</label>
              <textarea 
                style={{ ...textareaStyle, width: '100%', minHeight: '80px' }}
                value={reportForm.description}
                onChange={e => setReportForm({...reportForm, description: e.target.value})}
              />
            </div>
            <button onClick={submitReport} style={reportSubmitBtn}>
              <Send size={16} /> Отправить
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const centerStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white', background: '#0f172a' };
const backButtonStyle = { display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', marginBottom: '20px' };
const playerWrapper = { width: '100%', aspectRatio: '16/9', background: '#000', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' };
const actionBtn = { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '12px', border: 'none', color: 'white', cursor: 'pointer', background: '#1e293b', fontWeight: '600' };
const descriptionBox = { background: '#1e293b', padding: '20px', borderRadius: '16px', border: '1px solid #334155' };
const metaDate = { display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', marginBottom: '10px', fontSize: '0.85rem' };
const textareaStyle = { flex: 1, background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', color: 'white', padding: '14px', resize: 'none', minHeight: '60px', outline: 'none' };
const submitBtn = { background: '#3b82f6', border: 'none', color: 'white', padding: '0 25px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' };
const iconBtn = { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', padding: 0 };
const commentReportBtn = { background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '4px' };
const labelStyle = { display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: '#94a3b8', fontWeight: 'bold' };
const selectStyle = { width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', padding: '10px', color: 'white', outline: 'none' };
const reportSubmitBtn = { width: '100%', background: '#ef4444', border: 'none', color: 'white', padding: '12px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' };
const recCard = { display: 'flex', gap: '12px', cursor: 'pointer', background: '#1e293b', padding: '8px', borderRadius: '12px' };
const recImg = { width: '140px', height: '80px', borderRadius: '8px', flexShrink: 0 };
const recTitle = { fontSize: '0.9rem', fontWeight: 'bold', color: '#f1f5f9', marginBottom: '4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' };
const recDesc = { fontSize: '0.8rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
const modalOverlay = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContent = { background: '#1e293b', padding: '25px', borderRadius: '24px', width: '400px', border: '1px solid #334155' };
const playlistRow = { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', cursor: 'pointer', borderRadius: '10px', background: '#0f172a', marginBottom: '8px' };

export default VideoPlayerPage;