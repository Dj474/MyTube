import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from './api';
import { 
  User, MapPin, Calendar, Edit3, Save, X, 
  UserCircle, Camera, UserPlus, UserMinus 
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
  
  // Состояние подписки, которое будем менять локально после клика
  const [isSubscribed, setIsSubscribed] = useState(false);

  const fetchAvatar = async (path) => {
    if (!path) {
      setAvatarUrl(null);
      return;
    }
    try {
      const response = await api.get(path, { responseType: 'blob' });
      const objectUrl = URL.createObjectURL(response.data);
      setAvatarUrl(objectUrl);
    } catch (err) {
      setAvatarUrl(null);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const targetId = effectiveUserId || currentUserId;
      
      if (!targetId || targetId === "undefined") {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await api.get(`/profile/${targetId}`);
        setProfile(response.data);
        setFormData(response.data);
        
        // --- ВОТ ТУТ: Используем поле из твоего DTO ---
        setIsSubscribed(response.data.isSubscribed); 
        
        if (response.data.photoUrl) {
          fetchAvatar(response.data.photoUrl);
        }
      } catch (err) {
        console.error("Ошибка загрузки профиля:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      if (avatarUrl) URL.revokeObjectURL(avatarUrl);
    };
  }, [effectiveUserId, currentUserId]);

  const handleSubscribe = async () => {
  try {
    if (isSubscribed) {
      // DELETE /api/v1/subscription?authorId=123
      await api.delete(`/subscription`, { params: { authorId: effectiveUserId } });
      setIsSubscribed(false);
    } else {
      // POST /api/v1/subscription?authorId=123
      await api.post(`/subscription`, null, { params: { authorId: effectiveUserId } });
      setIsSubscribed(true);
    }
  } catch (err) {
    console.error("Ошибка подписки:", err);
  }
};

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const uploadData = new FormData();
    uploadData.append('file', file);
    try {
      await api.post('/profile/photo', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const response = await api.get(`/profile/${currentUserId}`);
      setProfile(response.data);
      fetchAvatar(response.data.photoUrl);
    } catch (err) {
      alert("Ошибка загрузки фото");
    }
  };

  const handleSave = async () => {
    try {
      const response = await api.put('/profile/me', formData);
      setProfile(response.data);
      setIsEditing(false);
      alert("Профиль обновлен!");
    } catch (err) {
      alert("Ошибка сохранения");
    }
  };

  if (loading) return <div style={centerStyle}>Загрузка...</div>;
  if (!profile) return <div style={centerStyle}>Профиль не найден (ID: {userId})</div>;

  return (
    <div style={{ padding: '40px 20px', backgroundColor: '#0f172a', minHeight: '100vh', color: '#f1f5f9' }}>
      <div style={containerStyle}>
        <div style={headerBannerStyle}>
          <div style={avatarContainerStyle}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" style={avatarImageStyle} />
            ) : (
              <User size={60} color="#3b82f6" />
            )}
            
            {isMyProfile && (
              <div onClick={() => fileInputRef.current.click()} style={cameraIconStyle}>
                <Camera size={20} color="white" />
              </div>
            )}
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handlePhotoUpload} />
          </div>
        </div>

        <div style={{ padding: '70px 40px 40px 40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px' }}>
            <div>
              <h1 style={{ fontSize: '2rem', margin: 0 }}>
                {profile.firstName || 'Пользователь'} {profile.lastName || ''}
              </h1>
              <p style={{ color: '#94a3b8', marginTop: '5px' }}>@{profile.nickname || `id${profile.userId}`}</p>
            </div>
            
            {/* КНОПКА: Переключается в зависимости от того, мой это профиль или чужой */}
            {isMyProfile ? (
              <button 
                onClick={() => { setIsEditing(!isEditing); setFormData(profile); }}
                style={{ ...buttonBase, background: isEditing ? '#334155' : '#3b82f6' }}
              >
                {isEditing ? <><X size={18}/> Отмена</> : <><Edit3 size={18}/> Редактировать</>}
              </button>
            ) : (
              <button 
                onClick={handleSubscribe}
                style={{ 
                  ...buttonBase, 
                  background: isSubscribed ? '#334155' : '#ef4444', // Красный для отписки или серый на выбор
                  border: isSubscribed ? '1px solid #475569' : 'none'
                }}
              >
                {isSubscribed ? (
                  <><UserMinus size={18}/> Отписаться</>
                ) : (
                  <><UserPlus size={18}/> Подписаться</>
                )}
              </button>
            )}
          </div>

          <div style={{ marginTop: '30px', borderTop: '1px solid #334155', paddingTop: '30px' }}>
            {isEditing && isMyProfile ? (
              <div style={formGridStyle}>
                <div>
                  <label style={labelStyle}>Имя</label>
                  <input style={inputStyle} value={formData.firstName || ''} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                </div>
                <div>
                  <label style={labelStyle}>Фамилия</label>
                  <input style={inputStyle} value={formData.lastName || ''} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={labelStyle}>О себе</label>
                  <textarea style={{...inputStyle, resize: 'none', height: '100px'}} value={formData.bio || ''} onChange={e => setFormData({...formData, bio: e.target.value})} />
                </div>
                <div style={{ gridColumn: 'span 2', textAlign: 'right' }}>
                  <button onClick={handleSave} style={saveButtonStyle}>
                    <Save size={18}/> Сохранить
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                <div>
                  <h3 style={sectionTitleStyle}>О себе</h3>
                  <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#cbd5e1', margin: 0 }}>
                    {profile.bio || "Информация отсутствует."}
                  </p>
                </div>
                
                <div style={infoGridStyle}>
                  <div style={infoBlockStyle}>
                    <MapPin size={20} color="#3b82f6" />
                    <div>
                      <span style={infoLabelStyle}>Местоположение</span>
                      <div style={infoValueStyle}>{profile.location || "Не указано"}</div>
                    </div>
                  </div>
                  <div style={infoBlockStyle}>
                    <Calendar size={20} color="#3b82f6" />
                    <div>
                      <span style={infoLabelStyle}>Дата рождения</span>
                      <div style={infoValueStyle}>{profile.birthDate || "Не указано"}</div>
                    </div>
                  </div>
                  <div style={infoBlockStyle}>
                    <UserCircle size={20} color="#3b82f6" />
                    <div>
                      <span style={infoLabelStyle}>Пол</span>
                      <div style={infoValueStyle}>
                        {profile.gender === 'MALE' ? 'Мужской' : profile.gender === 'FEMALE' ? 'Женский' : "Не указан"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Стили без изменений
const containerStyle = { maxWidth: '800px', margin: '0 auto', background: '#1e293b', borderRadius: '24px', overflow: 'hidden', border: '1px solid #334155' };
const headerBannerStyle = { height: '150px', background: 'linear-gradient(90deg, #1e3a8a 0%, #3b82f6 100%)', position: 'relative' };
const avatarContainerStyle = { position: 'absolute', bottom: '-50px', left: '40px', width: '120px', height: '120px', borderRadius: '50%', background: '#0f172a', border: '4px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const avatarImageStyle = { width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' };
const cameraIconStyle = { position: 'absolute', bottom: '5px', right: '5px', background: '#3b82f6', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '3px solid #0f172a' };
const centerStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a', color: 'white' };
const labelStyle = { display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: '#94a3b8', fontWeight: 'bold' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '10px', background: '#0f172a', border: '1px solid #334155', color: 'white', outline: 'none' };
const formGridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' };
const infoGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '30px' };
const infoBlockStyle = { display: 'flex', alignItems: 'flex-start', gap: '12px' };
const infoLabelStyle = { fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' };
const infoValueStyle = { fontSize: '1rem', color: '#cbd5e1' };
const sectionTitleStyle = { fontSize: '0.9rem', color: '#3b82f6', textTransform: 'uppercase', marginBottom: '10px' };
const buttonBase = { display: 'flex', alignItems: 'center', gap: '8px', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', transition: '0.2s' };
const saveButtonStyle = { background: '#10b981', color: 'white', border: 'none', padding: '12px 30px', borderRadius: '12px', cursor: 'pointer' };

export default ProfilePage;