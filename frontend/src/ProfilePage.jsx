import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from './api';
import { User, MapPin, Calendar, Edit3, Save, X, Info, UserCircle } from 'lucide-react';

const ProfilePage = () => {
  const { userId } = useParams();
  const currentUserId = localStorage.getItem('userId');
  // Если userId в URL совпадает с тем, что в localStorage, или его вовсе нет — это мой профиль
  const isMyProfile = !userId || userId.toString() === currentUserId?.toString();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        // Если зашли просто на /profile, грузим свой ID из localStorage
        const targetId = userId || currentUserId;
        if (!targetId) return;

        const response = await api.get(`/profile/${targetId}`);
        setProfile(response.data);
        setFormData(response.data);
      } catch (err) {
        console.error("Ошибка загрузки профиля:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId, currentUserId]);

  const handleSave = async () => {
    try {
      // Отправляем объект точно по структуре ProfileDtoIn
      const response = await api.put('/profile/me', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        bio: formData.bio,
        location: formData.location,
        birthDate: formData.birthDate,
        gender: formData.gender
      });
      setProfile(response.data);
      setIsEditing(false);
      alert("Профиль успешно обновлен!");
    } catch (err) {
      alert("Ошибка при сохранении: " + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <div style={centerStyle}><div className="spinner"></div></div>;
  if (!profile) return <div style={centerStyle}>Профиль не найден</div>;

  return (
    <div style={{ padding: '40px 20px', backgroundColor: '#0f172a', minHeight: '100vh', color: '#f1f5f9' }}>
      <div style={containerStyle}>
        
        {/* --- ХЕДЕР ПРОФИЛЯ --- */}
        <div style={headerBannerStyle}>
          <div style={avatarContainerStyle}>
            <User size={60} color="#3b82f6" />
          </div>
        </div>

        <div style={{ padding: '70px 40px 40px 40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <h1 style={{ fontSize: '2rem', margin: 0 }}>
                {profile.firstName || 'Имя'} {profile.lastName || 'Не указано'}
              </h1>
              <p style={{ color: '#94a3b8', marginTop: '5px' }}>ID пользователя: {profile.userId}</p>
            </div>
            
            {isMyProfile && (
              <button 
                onClick={() => { setIsEditing(!isEditing); setFormData(profile); }}
                style={{ ...buttonBase, background: isEditing ? '#334155' : '#3b82f6' }}
              >
                {isEditing ? <><X size={18}/> Отмена</> : <><Edit3 size={18}/> Редактировать</>}
              </button>
            )}
          </div>

          <div style={{ marginTop: '30px', borderTop: '1px solid #334155', paddingTop: '30px' }}>
            {isEditing ? (
              /* --- РЕЖИМ РЕДАКТИРОВАНИЯ --- */
              <div style={formGridStyle}>
                <div>
                  <label style={labelStyle}>Имя</label>
                  <input style={inputStyle} value={formData.firstName || ''} onChange={e => setFormData({...formData, firstName: e.target.value})} placeholder="Ваше имя" />
                </div>
                <div>
                  <label style={labelStyle}>Фамилия</label>
                  <input style={inputStyle} value={formData.lastName || ''} onChange={e => setFormData({...formData, lastName: e.target.value})} placeholder="Ваша фамилия" />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={labelStyle}>О себе</label>
                  <textarea style={{...inputStyle, resize: 'none', height: '100px'}} value={formData.bio || ''} onChange={e => setFormData({...formData, bio: e.target.value})} placeholder="Расскажите о себе..." />
                </div>
                <div>
                  <label style={labelStyle}>Местоположение</label>
                  <input style={inputStyle} value={formData.location || ''} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="Город, страна" />
                </div>
                <div>
                  <label style={labelStyle}>Дата рождения</label>
                  <input type="date" style={inputStyle} value={formData.birthDate || ''} onChange={e => setFormData({...formData, birthDate: e.target.value})} />
                </div>
                <div>
                  <label style={labelStyle}>Пол</label>
                  <select 
                    style={inputStyle} 
                    value={formData.gender || ''} 
                    onChange={e => setFormData({...formData, gender: e.target.value})}
                  >
                    <option value="">Не указан</option>
                    <option value="MALE">Мужской</option>
                    <option value="FEMALE">Женский</option>
                    <option value="OTHER">Другой</option>
                  </select>
                </div>
                <div style={{ gridColumn: 'span 2', textAlign: 'right', marginTop: '10px' }}>
                  <button onClick={handleSave} style={saveButtonStyle}>
                    <Save size={18}/> Сохранить изменения
                  </button>
                </div>
              </div>
            ) : (
              /* --- РЕЖИМ ПРОСМОТРА --- */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                <div>
                  <h3 style={sectionTitleStyle}>Биография</h3>
                  <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#cbd5e1', margin: 0 }}>
                    {profile.bio || "Пользователь еще не заполнил информацию о себе."}
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
                        {profile.gender === 'MALE' ? 'Мужской' : profile.gender === 'FEMALE' ? 'Женский' : profile.gender || "Не указан"}
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

// --- СТИЛИ ---
const containerStyle = { maxWidth: '800px', margin: '0 auto', background: '#1e293b', borderRadius: '24px', overflow: 'hidden', border: '1px solid #334155' };
const headerBannerStyle = { height: '150px', background: 'linear-gradient(90deg, #1e3a8a 0%, #3b82f6 100%)', position: 'relative' };
const avatarContainerStyle = { position: 'absolute', bottom: '-50px', left: '40px', width: '120px', height: '120px', borderRadius: '50%', background: '#0f172a', border: '4px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const centerStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a', color: 'white' };
const labelStyle = { display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: '#94a3b8', fontWeight: 'bold' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '10px', background: '#0f172a', border: '1px solid #334155', color: 'white', outline: 'none', fontSize: '1rem' };
const formGridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' };
const infoGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '30px', marginTop: '10px' };
const infoBlockStyle = { display: 'flex', alignItems: 'flex-start', gap: '12px' };
const infoLabelStyle = { fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' };
const infoValueStyle = { fontSize: '1rem', color: '#cbd5e1', marginTop: '2px' };
const sectionTitleStyle = { fontSize: '0.9rem', color: '#3b82f6', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '1px' };

const buttonBase = { display: 'flex', alignItems: 'center', gap: '8px', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', transition: '0.3s', fontWeight: '600' };
const saveButtonStyle = { background: '#10b981', color: 'white', border: 'none', padding: '12px 30px', borderRadius: '12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', transition: '0.2s' };

export default ProfilePage;