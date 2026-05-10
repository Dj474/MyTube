import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from './api'; 
import { User, PlayCircle } from 'lucide-react';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const navigate = useNavigate();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const performSearch = async () => {
      if (!query) return;
      setLoading(true);
      try {
        const response = await api.get('/search', { params: { key: query, page: 0, size: 20 } });
        const searchItems = response.data.content;

        const enrichedResults = await Promise.all(
          searchItems.map(async (item) => {
            try {
              // ВАЖНО: Проверяем наличие ID перед запросом
              if (!item.id) return null;

              if (item.entityType === 'VIDEO') {
                const res = await api.get(`/videos/${item.id}`);
                // Принудительно сохраняем id, чтобы он не потерялся
                return { ...res.data, id: item.id, type: 'VIDEO' };
              } else {
                const res = await api.get(`/profile/${item.id}`);
                // Принудительно сохраняем id, если бэкенд вернул только userId
                return { ...res.data, id: item.id, type: 'USER' };
              }
            } catch (e) {
              return null; 
            }
          })
        );

        setResults(enrichedResults.filter(r => r !== null));
      } catch (err) {
        console.error("Ошибка поиска", err);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query]);

  // Функция для безопасного перехода
  const handleNavigate = (item) => {
    // Пробуем все варианты ID, которые могут быть в объекте
    const targetId = item.id || item.userId;
    
    if (!targetId) {
      console.error("Не удалось найти ID для перехода:", item);
      return;
    }

    if (item.type === 'VIDEO') {
      navigate(`/video/${targetId}`);
    } else {
      navigate(`/profile/${targetId}`);
    }
  };

  if (loading) return <div style={{ color: 'white', padding: '20px' }}>Поиск результатов для "{query}"...</div>;

  return (
    <div>
      <h2 style={{ color: 'white', marginBottom: '24px' }}>Результаты по запросу: {query}</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {results.length > 0 ? (
          results.map((item, index) => (
            <div 
              key={index}
              onClick={() => handleNavigate(item)}
              style={resultCardStyle}
            >
              {item.type === 'VIDEO' ? (
                <>
                  <div style={thumbnailStyle}><PlayCircle size={40} color="#3b82f6" /></div>
                  <div>
                    <h3 style={{ color: 'white', margin: '0 0 4px 0' }}>{item.title}</h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Видео • {item.authorNickname}</p>
                  </div>
                </>
              ) : (
                <>
                  <div style={avatarStyle}><User size={40} color="white" /></div>
                  <div>
                    <h3 style={{ color: 'white', margin: '0 0 4px 0' }}>{item.nickname || item.name || "Пользователь"}</h3>
                    <p style={{ color: '#3b82f6', fontSize: '0.9rem' }}>Канал • Подписчиков: {item.subscribersCount || 0}</p>
                  </div>
                </>
              )}
            </div>
          ))
        ) : (
          <p style={{ color: '#64748b' }}>Ничего не найдено</p>
        )}
      </div>
    </div>
  );
};

const resultCardStyle = {
  display: 'flex', gap: '20px', alignItems: 'center', padding: '16px',
  backgroundColor: '#1e293b', borderRadius: '12px', cursor: 'pointer', transition: '0.2s'
};

const thumbnailStyle = {
  width: '160px', height: '90px', backgroundColor: '#0f172a', borderRadius: '8px',
  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
};

const avatarStyle = {
  width: '90px', height: '90px', backgroundColor: '#3b82f6', borderRadius: '50%',
  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
};

export default SearchPage;