import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8090/api/v1',
});

// 1. Добавляем Access Token в каждый запрос
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Обработка ответов и обновление токена
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Условие для обновления токена:
    // - Ошибка 401 (Unauthorized)
    // - Мы еще не пробовали повторить этот конкретный запрос (_retry)
    // - Это НЕ был запрос на сам логин или рефреш (чтобы не зациклиться)
    if (
      error.response?.status === 401 && 
      !originalRequest._retry && 
      !originalRequest.url.includes('/auth/refresh') &&
      !originalRequest.url.includes('/auth/login')
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        console.log("Попытка обновления токена...");
        
        // Важно: используем чистый axios, а не наш api-экземпляр, 
        // чтобы не сработали интерцепторы этого же файла
        const res = await axios.post('http://localhost:8090/api/v1/auth/refresh', {
          refreshToken: refreshToken
        });

        if (res.status === 200) {
          const { accessToken, refreshToken: newRefreshToken } = res.data;
          
          // Сохраняем новые данные
          localStorage.setItem('token', accessToken);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }

          console.log("Токен успешно обновлен.");

          // Обновляем заголовок и повторяем изначальный запрос
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest); 
        }
      } catch (refreshError) {
        // Если /refresh вернул ошибку — значит всё, сессия мертва
        console.error("Refresh token невалиден. Выход из системы...");
        handleLogout();
        return Promise.reject(refreshError);
      }
    }

    // Если ошибка 401 пришла от самого эндпоинта /refresh — сразу на выход
    if (error.response?.status === 401 && originalRequest.url.includes('/auth/refresh')) {
      handleLogout();
    }

    return Promise.reject(error);
  }
);

// Функция для очистки и редиректа
function handleLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userId');
  
  // Чтобы не делать редирект, если пользователь и так на странице входа
  if (!window.location.pathname.includes('/auth')) {
    window.location.href = '/auth';
  }
}

export default api;