import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';
import { ListMusic, ChevronRight, Plus, X, Trash2 } from 'lucide-react'; // Добавил Trash2

const PlaylistsPage = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPlaylist, setNewPlaylist] = useState({ title: '', description: '' });
  
  const navigate = useNavigate();

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      const res = await api.get('/videos/playlist/my', { params: { page: 0, size: 20 } });
      setPlaylists(res.data.content || []);
    } catch (err) {
      console.error("Ошибка при загрузке плейлистов:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/videos/playlist', newPlaylist);
      setIsModalOpen(false);
      setNewPlaylist({ title: '', description: '' });
      fetchPlaylists();
    } catch (err) {
      alert("Ошибка при создании плейлиста");
    }
  };

  // ФУНКЦИЯ УДАЛЕНИЯ ПЛЕЙЛИСТА
  const handleDelete = async (e, playlistId) => {
    e.stopPropagation(); // ВАЖНО: чтобы не перешло на страницу плейлиста
    if (!window.confirm("Вы уверены, что хотите удалить этот плейлист?")) return;

    try {
      await api.delete(`/videos/playlist/${playlistId}`);
      // Обновляем стейт локально, чтобы не делать лишний запрос к серверу
      setPlaylists(playlists.filter(p => p.id !== playlistId));
    } catch (err) {
      console.error("Ошибка при удалении:", err);
      alert("Не удалось удалить плейлист");
    }
  };

  if (loading) return <div style={{ color: '#94a3b8', textAlign: 'center', marginTop: '100px' }}>Загрузка...</div>;

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ListMusic size={32} color="#3b82f6" />
          <h1 style={{ color: 'white', fontSize: '2rem', margin: 0 }}>Мои плейлисты</h1>
        </div>
        
        <button onClick={() => setIsModalOpen(true)} style={createButtonStyle}>
          <Plus size={20} /> Создать плейлист
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
        {playlists.map((playlist) => (
          <div key={playlist.id} onClick={() => navigate(`/playlist/${playlist.id}`)} style={playlistCardStyle}>
            <div style={playlistIconWrapper}><ListMusic size={40} color="#64748b" /></div>
            
            <div style={{ flex: 1 }}>
              <h3 style={{ color: 'white', margin: '0 0 4px 0' }}>{playlist.title}</h3>
              <p style={{ color: '#94a3b8', margin: 0 }}>{playlist.description || "Без описания"}</p>
            </div>

            {/* КНОПКА УДАЛЕНИЯ */}
            <button 
              onClick={(e) => handleDelete(e, playlist.id)} 
              style={deleteButtonStyle}
              title="Удалить плейлист"
            >
              <Trash2 size={20} color="#f87171" />
            </button>

            <ChevronRight size={24} color="#475569" />
          </div>
        ))}

        {playlists.length === 0 && (
          <div style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>
            У вас пока нет плейлистов. Создайте первый!
          </div>
        )}
      </div>

      {isModalOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ color: 'white', margin: 0 }}>Новый плейлист</h2>
              <X color="white" cursor="pointer" onClick={() => setIsModalOpen(false)} />
            </div>
            
            <form onSubmit={handleCreate}>
              <input 
                required
                placeholder="Название плейлиста" 
                value={newPlaylist.title}
                onChange={(e) => setNewPlaylist({...newPlaylist, title: e.target.value})}
                style={inputStyle}
              />
              <textarea 
                placeholder="Описание (необязательно)" 
                value={newPlaylist.description}
                onChange={(e) => setNewPlaylist({...newPlaylist, description: e.target.value})}
                style={{ ...inputStyle, minHeight: '100px', resize: 'none' }}
              />
              <button type="submit" style={submitButtonStyle}>Создать</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Стили ---
const createButtonStyle = { display: 'flex', alignItems: 'center', gap: '8px', background: '#3b82f6', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' };
const playlistCardStyle = { display: 'flex', alignItems: 'center', gap: '20px', padding: '20px', background: '#1e293b', borderRadius: '16px', cursor: 'pointer', border: '1px solid #334155', transition: '0.2s ease' };
const playlistIconWrapper = { width: '80px', height: '80px', background: '#0f172a', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' };

// СТИЛЬ КНОПКИ УДАЛЕНИЯ
const deleteButtonStyle = { 
  background: 'none', 
  border: 'none', 
  cursor: 'pointer', 
  padding: '10px', 
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background 0.2s',
  marginRight: '10px'
};

const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalContentStyle = { background: '#1e293b', padding: '30px', borderRadius: '20px', width: '100%', maxWidth: '400px', border: '1px solid #334155' };
const inputStyle = { width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', padding: '12px', color: 'white', marginBottom: '15px', outline: 'none' };
const submitButtonStyle = { width: '100%', background: '#3b82f6', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' };

export default PlaylistsPage;