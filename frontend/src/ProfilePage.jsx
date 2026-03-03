import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from './api';
import { User, MapPin, Calendar, Edit3, Save, X, Info } from 'lucide-react';

const ProfilePage = () => {
  const { userId } = useParams(); // ID пользователя из URL
  const currentUserId = localStorage.getItem('userId'); // Твой ID из стораджа
  const isMyProfile = !userId || userId === currentUserId;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  // Загрузка данных профиля
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        // Если ID в URL нет, идем в /me (если бэкенд позволяет) или используем сохраненный ID
        const targetId = userId || currentUserId;
        const response = await api.get(`/profile/${targetId}`);
        setProfile(response.data);
        setFormData(response.data); // Предзаполняем форму для редактирования
      } catch (err) {
        console.error("Ошибка загрузки профиля:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId, currentUserId]);

  // Обработка сохранения
  const handleSave = async () => {
    try {
      // Отправляем ProfileDtoIn на /api/v1/profile/me
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
      alert("Профиль обновлен!");
    } catch (err) {
      alert("Ошибка при сохранении: " + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <div className="spinner-container">Загрузка...</div>;
  if (!profile) return <div style={{ color: 'white', textAlign: 'center' }}>Профиль не найден</div>;

  return (
    <div style={{ padding: '40px 20px', backgroundColor: '#0f172a', minHeight: '100vh', color: '#f1f5f9' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', background: '#1e293b', borderRadius: '24px', overflow: 'hidden', border: '1px solid #334155' }}>
        
        {/* Шапка профиля */}
        <div style={{ height: '150px', background: 'linear-gradient(90deg, #1e3a8a 0%, #3b82f6 100%)', position: 'relative' }}>
          <div style={{ position: 'absolute', bottom: '-50px', left: '40px', width: '120px', height: '120px', borderRadius: '50%', background: '#0f172a', border: '4px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={60} color="#3b82f6" />
          </div>
        </div>

        <div style={{ padding: '70px 40px 40px 40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: '2rem', margin: 0 }}>
                {profile.firstName} {profile.lastName}
              </h1>
              <p style={{ color: '#94a3b8', marginTop: '5px' }}>@{profile.userId}</p>
            </div>
            
            {isMyProfile && (
              <button 
                onClick={() => setIsEditing(!isEditing)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', background: isEditing ? '#334155' : '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', transition: '0.3s' }}
              >
                {isEditing ? <><X size={18}/> Отмена</> : <><Edit3 size={18}/> Редактировать</>}
              </button>
            )}
          </div>

          <div style={{ marginTop: '30px', borderTop: '1px solid #334155', paddingTop: '30px' }}>
            {isEditing ? (
              /* --- ФОРМА РЕДАКТИРОВАНИЯ --- */
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
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
                <div>
                  <label style={labelStyle}>Местоположение</label>
                  <input style={inputStyle} value={formData.location || ''} onChange={e => setFormData({...formData, location: e.target.value})} />
                </div>
                <div>
                  <label style={labelStyle}>Дата рождения</label>
                  <input type="date" style={inputStyle} value={formData.birthDate || ''} onChange={e => setFormData({...formData, birthDate: e.target.value})} />
                </div>
                <div style={{ gridColumn: 'span 2', textAlign: 'right', marginTop: '10px' }}>
                  <button onClick={handleSave} style={{ background: '#10b981', color: 'white', border: 'none', padding: '12px 30px', borderRadius: '12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                    <Save size={18}/> Сохранить изменения
                  </button>
                </div>
              </div>
            ) : (
              /* --- РЕЖИМ ПРОСМОТРА --- */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#cbd5e1' }}>
                  {profile.bio || "Пользователь еще не заполнил информацию о себе."}
                </p>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '10px' }}>
                  <div style={infoBlockStyle}>
                    <MapPin size={18} color="#94a3b8" />
                    <span>{profile.location || "Земля"}</span>
                  </div>
                  <div style={infoBlockStyle}>
                    <Calendar size={18} color="#94a3b8" />
                    <span>Родился: {profile.birthDate || "Не указано"}</span>
                  </div>
                  <div style={infoBlockStyle}>
                    <Info size={18} color="#94a3b8" />
                    <span>Пол: {profile.gender || "Не указан"}</span>
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

// Стили
const labelStyle = { display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: '#94a3b8', fontWeight: 'bold' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '10px', background: '#0f172a', border: '1px solid #334155', color: 'white', outline: 'none' };
const infoBlockStyle = { display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1', fontSize: '0.95rem' };

export default ProfilePage;