import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Image as ImageIcon } from 'lucide-react';

const ProtectedThumbnail = ({ url }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob' // Важно: получаем данные как бинарный объект
        });

        // Создаем локальную ссылку на скачанный файл
        const objectUrl = URL.createObjectURL(response.data);
        setImageSrc(objectUrl);
      } catch (err) {
        console.error("Ошибка загрузки превью:", err);
        setError(true);
      }
    };

    if (url) fetchImage();

    // Очистка памяти при размонтировании компонента
    return () => {
      if (imageSrc) URL.revokeObjectURL(imageSrc);
    };
  }, [url]);

  if (error || !url) {
    return (
      <div style={{ width: '100%', height: '100%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ImageIcon size={40} color="#cbd5e1" />
      </div>
    );
  }

  return (
    <img 
      src={imageSrc} 
      alt="Preview" 
      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
    />
  );
};

export default ProtectedThumbnail;