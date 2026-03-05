import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Upload, ArrowLeft, X, Search } from 'lucide-react';
import api from './api'; // Используем твой настроенный экземпляр axios

const UploadVideo = () => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Состояния для тегов
  const [tagQuery, setTagQuery] = useState('');
  const [foundTags, setFoundTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  
  const navigate = useNavigate();

  // Поиск тегов при вводе
  useEffect(() => {
    const searchTags = async () => {
      if (tagQuery.length < 2) {
        setFoundTags([]);
        return;
      }
      try {
        // Запрос к твоему новому контроллеру
        //params передаем как объект, Spring распарсит их в PageableParams
        const response = await api.get('/videos/tags/search', {
          params: { query: tagQuery, page: 0, size: 5 }
        });
        setFoundTags(response.data.content || []);
      } catch (err) {
        console.error("Ошибка поиска тегов", err);
      }
    };

    const timeoutId = setTimeout(searchTags, 300); // Debounce
    return () => clearTimeout(timeoutId);
  }, [tagQuery]);

  const handleSelectTag = (tag) => {
    if (!selectedTags.find(t => t.id === tag.id)) {
      setSelectedTags([...selectedTags, tag]);
    }
    setTagQuery('');
    setFoundTags([]);
  };

  const removeTag = (tagId) => {
    setSelectedTags(selectedTags.filter(t => t.id !== tagId));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);

    // Создаем DTO для соответствия @RequestPart("info")
    const info = {
      title,
      description,
      tagIds: selectedTags.map(t => t.id)
    };

    // Важно: упаковываем JSON в Blob с типом application/json
    formData.append('info', new Blob([JSON.stringify(info)], {
      type: 'application/json'
    }));

    try {
      await api.post('/videos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Видео успешно загружено!');
      navigate('/');
    } catch (err) {
      alert('Ошибка при загрузке: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '600px' }}>
        <button onClick={() => navigate(-1)} style={backButtonStyle}>
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
            <textarea style={textareaStyle} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          {/* --- СЕКЦИЯ ТЕГОВ --- */}
          <div className="input-group" style={{ position: 'relative' }}>
            <label>Теги (минимум 2 символа для поиска)</label>
            <div style={tagInputContainer}>
              {selectedTags.map(tag => (
                <span key={tag.id} style={tagBadgeStyle}>
                  {tag.displayName}
                  <X size={14} onClick={() => removeTag(tag.id)} style={{ cursor: 'pointer' }} />
                </span>
              ))}
              <input 
                type="text" 
                placeholder="Поиск тегов..." 
                value={tagQuery}
                onChange={(e) => setTagQuery(e.target.value)}
                style={tagInnerInput}
              />
            </div>
            
            {/* Выпадающий список результатов */}
            {foundTags.length > 0 && (
              <div style={dropdownStyle}>
                {foundTags.map(tag => (
                  <div key={tag.id} onClick={() => handleSelectTag(tag)} style={dropdownItemStyle}>
                    {tag.displayName}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="input-group">
            <label>Выберите файл</label>
            <input type="file" accept="video/*" onChange={(e) => setFile(e.target.files[0])} required />
          </div>

          <button type="submit" className="blue-btn" disabled={loading || !file}>
            {loading ? 'Загрузка...' : <><Upload size={18} /> Опубликовать</>}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- Стили ---
const tagInputContainer = {
  display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '8px',
  borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: 'white'
};
const tagInnerInput = { border: 'none', outline: 'none', flex: 1, minWidth: '120px', padding: '4px' };
const tagBadgeStyle = {
  display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#dbeafe',
  color: '#1e40af', padding: '4px 8px', borderRadius: '4px', fontSize: '14px'
};
const dropdownStyle = {
  position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
  backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '4px', marginTop: '4px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
};
const dropdownItemStyle = { padding: '10px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', color: '#334155' };
const textareaStyle = { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', minHeight: '80px' };
const backButtonStyle = { background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '20px' };

export default UploadVideo;