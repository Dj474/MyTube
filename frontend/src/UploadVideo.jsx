import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Upload, ArrowLeft } from 'lucide-react';

const UploadVideo = () => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpload = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('userId', localStorage.getItem('userId'));

    try {
      await axios.post('http://localhost:8090/api/v1/videos/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      alert('Видео успешно загружено!');
      navigate('/'); // Возвращаемся на главную
    } catch (err) {
      alert('Ошибка при загрузке: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '500px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '20px' }}>
          <ArrowLeft size={18} /> Назад
        </button>
        <h2 className="auth-title">Загрузка нового видео</h2>
        <form onSubmit={handleUpload}>
          <div className="input-group">
            <label>Название</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="input-group">
            <label>Описание</label>
            <textarea 
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', minHeight: '80px' }}
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
            />
          </div>
          <div className="input-group">
            <label>Выберите файл</label>
            <input type="file" accept="video/*" onChange={(e) => setFile(e.target.files[0])} required />
          </div>
          <button type="submit" className="blue-btn" disabled={loading}>
            {loading ? 'Загрузка...' : <><Upload size={18} /> Опубликовать</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadVideo;