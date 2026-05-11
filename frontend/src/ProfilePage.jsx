import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from './api';
import { 
  User, MapPin, Calendar, Edit3, Save, X, 
  UserCircle, Camera, UserPlus, UserMinus,
  Flag, MessageSquare, Send, Heart, AlertTriangle
} from 'lucide-react';

const ProfilePage = () => {
  const { userId } = useParams(); 
  const currentUserId = localStorage.getItem('userId');
  
  const effectiveUserId = (userId && userId !== "undefined") ? userId : null;
  const isMyProfile = !effectiveUserId || effectiveUserId.toString() === currentUserId?.toString();
  
  const fileInputRef = useRef(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Состояния для жалоб и комментариев
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportData, setReportData] = useState({ reason: 'SPAM', description: '' });
  
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  const fetchAvatar = async (path) => {
    if (!path) { setAvatarUrl(null); return; }
    try {
      const response = await api.get(path, { responseType: 'blob' });
      setAvatarUrl(URL.createObjectURL(response.data));
    } catch (err) { setAvatarUrl(null); }
  };

  const fetchComments = async () => {
    const targetId = effectiveUserId || currentUserId;
    try {
      const res = await api.get(`/profile/comment/${targetId}/comments`, {
        params: { page: 0, size: 20 }
      });
      setComments(res.data.content || []);
    } catch (err) {
      console.error("Ошибка загрузки комментариев:", err);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const targetId = effectiveUserId || currentUserId;
      if (!targetId || targetId === "undefined") { setLoading(false); return; }

      try {
        setLoading(true);
        const response = await api.get(`/profile/${targetId}`);
        setProfile(response.data);
        setFormData(response.data);
        setIsSubscribed(response.data.isSubscribed); 
        
        if (response.data.photoUrl) fetchAvatar(response.data.photoUrl);
        
        fetchComments();
      } catch (err) {
        console.error("Ошибка загрузки профиля:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    return () => { if (avatarUrl) URL.revokeObjectURL(avatarUrl); };
  }, [effectiveUserId, currentUserId]);

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    const targetId = effectiveUserId || currentUserId;
    try {
      setCommentLoading(true);
      await api.post(`/profile/comment/${targetId}/comments`, { content: newComment });
      setNewComment('');
      fetchComments();
    } catch (err) {
      alert("Ошибка при публикации комментария");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      await api.post(`/profile/comment/comments/${commentId}/like`);
      fetchComments();
    } catch (err) { console.error("Лайк не удался"); }
  };

  const handleReportComment = async (commentId) => {
    const reason = window.prompt("Причина жалобы (SPAM, HARASSMENT, FRAUD, OTHER):", "SPAM");
    if (!reason) return;
    try {
      await api.post(`/profile/comment/comments/${commentId}/report`, { reason });
      alert("Жалоба на комментарий отправлена");
    } catch (err) { alert("Ошибка при отправке жалобы"); }
  };

  const handleSendUserReport = async () => {
    try {
      await api.post(`/profile/reports/${effectiveUserId}`, reportData);
      alert("Жалоба на пользователя отправлена");
      setIsReportModalOpen(false);
    } catch (err) { alert("Не удалось отправить жалобу"); }
  };

  const handleSubscribe = async () => {
    try {
      if (isSubscribed) {
        await api.delete(`/subscription`, { params: { authorId: effectiveUserId } });
        setIsSubscribed(false);
      } else {
        await api.post(`/subscription`, null, { params: { authorId: effectiveUserId } });
        setIsSubscribed(true);
      }
    } catch (err) { console.error("Ошибка подписки:", err); }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const uploadData = new FormData();
    uploadData.append('file', file);
    try {
      await api.post('/profile/photo', uploadData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const response = await api.get(`/profile/${currentUserId}`);
      setProfile(response.data);
      fetchAvatar(response.data.photoUrl);
    } catch (err) { alert("Ошибка загрузки фото"); }
  };

  const handleSave = async () => {
    try {
      const response = await api.put('/profile/me', formData);
      setProfile(response.data);
      setIsEditing(false);
      alert("Профиль обновлен!");
    } catch (err) { alert("Ошибка сохранения"); }
  };

  if (loading) return <div style={centerStyle}>Загрузка...</div>;
  if (!profile) return <div style={centerStyle}>Профиль не найден</div>;

  return (
    <div style={{ padding: '40px 20px', backgroundColor: '#0f172a', minHeight: '100vh', color: '#f1f5f9' }}>
      <div style={containerStyle}>
        <div style={headerBannerStyle}>
          <div style={avatarContainerStyle}>
            {avatarUrl ? <img src={avatarUrl} alt="Avatar" style={avatarImageStyle} /> : <User size={60} color="#3b82f6" />}
            {isMyProfile && (
              <div onClick={() => fileInputRef.current.click()} style={cameraIconStyle}>
                <Camera size={20} color="white" />
              </div>
            )}
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handlePhotoUpload} />
          </div>
        </div>

        <div style={{ padding: '70px 40px 40px 40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: '2rem', margin: 0 }}>{profile.firstName} {profile.lastName}</h1>
              <p style={{ color: '#94a3b8' }}>@{profile.nickname}</p>
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              {!isMyProfile && (
                <button onClick={() => setIsReportModalOpen(true)} style={reportIconBtnStyle} title="Пожаловаться на пользователя">
                  <Flag size={20} />
                </button>
              )}
              {isMyProfile ? (
                <button onClick={() => { setIsEditing(!isEditing); setFormData(profile); }} style={{ ...buttonBase, background: isEditing ? '#334155' : '#3b82f6' }}>
                  {isEditing ? <><X size={18}/> Отмена</> : <><Edit3 size={18}/> Редактировать</>}
                </button>
              ) : (
                <button onClick={handleSubscribe} style={{ ...buttonBase, background: isSubscribed ? '#334155' : '#ef4444' }}>
                  {isSubscribed ? <><UserMinus size={18}/> Отписаться</> : <><UserPlus size={18}/> Подписаться</>}
                </button>
              )}
            </div>
          </div>

          <div style={{ marginTop: '30px', borderTop: '1px solid #334155', paddingTop: '30px' }}>
            {isEditing ? (
              <div style={formGridStyle}>
                <div><label style={labelStyle}>Имя</label><input style={inputStyle} value={formData.firstName || ''} onChange={e => setFormData({...formData, firstName: e.target.value})} /></div>
                <div><label style={labelStyle}>Фамилия</label><input style={inputStyle} value={formData.lastName || ''} onChange={e => setFormData({...formData, lastName: e.target.value})} /></div>
                <div style={{ gridColumn: 'span 2' }}><label style={labelStyle}>О себе</label><textarea style={{...inputStyle, height: '100px'}} value={formData.bio || ''} onChange={e => setFormData({...formData, bio: e.target.value})} /></div>
                <div style={{ gridColumn: 'span 2', textAlign: 'right' }}><button onClick={handleSave} style={saveButtonStyle}><Save size={18}/> Сохранить</button></div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                <div><h3 style={sectionTitleStyle}>О себе</h3><p style={{ color: '#cbd5e1' }}>{profile.bio || "Информация отсутствует."}</p></div>
                <div style={infoGridStyle}>
                  <div style={infoBlockStyle}><MapPin size={20} color="#3b82f6" /><div><span style={infoLabelStyle}>Место</span><div style={infoValueStyle}>{profile.location || "Не указано"}</div></div></div>
                  <div style={infoBlockStyle}><Calendar size={20} color="#3b82f6" /><div><span style={infoLabelStyle}>Дата рождения</span><div style={infoValueStyle}>{profile.birthDate || "Не указано"}</div></div></div>
                </div>
              </div>
            )}
          </div>

          <div style={{ marginTop: '50px', borderTop: '2px solid #334155', paddingTop: '40px' }}>
            <h3 style={{ ...sectionTitleStyle, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MessageSquare size={20} /> Комментарии профиля
            </h3>

            <div style={commentInputWrapper}>
              <textarea 
                placeholder="Оставьте сообщение..." 
                style={commentTextArea}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button onClick={handlePostComment} disabled={commentLoading} style={sendBtnStyle}>
                <Send size={18} />
              </button>
            </div>

            <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {comments.map(c => (
                <div key={c.id} style={commentCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>{c.authorNickname}</span>
                    <span style={{ color: '#64748b', fontSize: '0.8rem' }}>{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p style={{ color: '#f1f5f9', margin: '0 0 12px 0' }}>{c.content}</p>
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <button onClick={() => handleLikeComment(c.id)} style={actionBtn}>
                      <Heart 
                        size={16} 
                        fill={c.liked ? "#ef4444" : "none"} 
                        color={c.liked ? "#ef4444" : "#94a3b8"} 
                      /> {c.likesCount}
                    </button>
                    <button onClick={() => handleReportComment(c.id)} style={actionBtn}>
                      <AlertTriangle size={16} color="#64748b" />
                    </button>
                  </div>
                </div>
              ))}
              {comments.length === 0 && <div style={{ color: '#64748b', textAlign: 'center' }}>Пока нет комментариев.</div>}
            </div>
          </div>
        </div>
      </div>

      {isReportModalOpen && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ color: 'white', margin: 0 }}>Пожаловаться</h2>
              <X cursor="pointer" onClick={() => setIsReportModalOpen(false)} />
            </div>
            <label style={labelStyle}>Причина</label>
            <select 
              style={inputStyle} 
              value={reportData.reason} 
              onChange={e => setReportData({...reportData, reason: e.target.value})}
            >
              <option value="SPAM">Спам</option>
              <option value="HARASSMENT">Оскорбление</option>
              <option value="FRAUD">Мошенничество</option>
              <option value="OTHER">Другое</option>
            </select>
            <label style={{ ...labelStyle, marginTop: '15px' }}>Описание</label>
            <textarea 
              style={{ ...inputStyle, height: '100px' }}
              value={reportData.description}
              onChange={e => setReportData({...reportData, description: e.target.value})}
            />
            <button onClick={handleSendUserReport} style={{ ...saveButtonStyle, width: '100%', marginTop: '20px' }}>
              Отправить жалобу
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const containerStyle = { maxWidth: '800px', margin: '0 auto', background: '#1e293b', borderRadius: '24px', overflow: 'hidden', border: '1px solid #334155' };
const headerBannerStyle = { height: '150px', background: 'linear-gradient(90deg, #1e3a8a 0%, #3b82f6 100%)', position: 'relative' };
const avatarContainerStyle = { position: 'absolute', bottom: '-50px', left: '40px', width: '120px', height: '120px', borderRadius: '50%', background: '#0f172a', border: '4px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const avatarImageStyle = { width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' };
const cameraIconStyle = { position: 'absolute', bottom: '5px', right: '5px', background: '#3b82f6', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '3px solid #0f172a' };
const centerStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a', color: 'white' };
const labelStyle = { display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: '#94a3b8', fontWeight: 'bold' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '10px', background: '#0f172a', border: '1px solid #334155', color: 'white', outline: 'none', marginBottom: '10px' };
const formGridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' };
const infoGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '30px' };
const infoBlockStyle = { display: 'flex', alignItems: 'flex-start', gap: '12px' };
const infoLabelStyle = { fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' };
const infoValueStyle = { fontSize: '1rem', color: '#cbd5e1' };
const sectionTitleStyle = { fontSize: '0.9rem', color: '#3b82f6', textTransform: 'uppercase', marginBottom: '10px' };
const buttonBase = { display: 'flex', alignItems: 'center', gap: '8px', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', transition: '0.2s' };
const saveButtonStyle = { background: '#10b981', color: 'white', border: 'none', padding: '12px 30px', borderRadius: '12px', cursor: 'pointer' };
const reportIconBtnStyle = { background: '#334155', border: 'none', color: '#f87171', padding: '10px', borderRadius: '12px', cursor: 'pointer' };
const commentInputWrapper = { position: 'relative', marginTop: '15px' };
const commentTextArea = { width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '15px', color: 'white', resize: 'none', minHeight: '100px', outline: 'none' };
const sendBtnStyle = { position: 'absolute', bottom: '15px', right: '15px', background: '#3b82f6', border: 'none', color: 'white', padding: '10px', borderRadius: '50%', cursor: 'pointer' };
const commentCard = { background: '#0f172a', padding: '15px', borderRadius: '12px', border: '1px solid #334155' };
const actionBtn = { background: 'none', border: 'none', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.9rem' };
const modalOverlay = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContent = { background: '#1e293b', padding: '30px', borderRadius: '24px', width: '90%', maxWidth: '450px', border: '1px solid #334155', color: 'white' };

export default ProfilePage;