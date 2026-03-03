import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './Auth';
import MyVideos from './MyVideos';
import UploadVideo from './UploadVideo';
import VideoPlayerPage from './VideoPlayerPage'; // Импортируем страницу плеера
import Layout from './Layout';

function App() {
  // Проверка авторизации (лучше делать проверку внутри компонентов или через стейт, 
  // но для текущей логики оставляем так)
  const isAuthenticated = !!localStorage.getItem('token');

  // Вспомогательный компонент для защищенных страниц с макетом (Sidebar)
  const ProtectedRoute = ({ children }) => {
    return isAuthenticated ? <Layout>{children}</Layout> : <Navigate to="/auth" />;
  };

  return (
    <Router>
      <Routes>
        {/* Страница логина/регистрации без Sidebar */}
        <Route 
          path="/auth" 
          element={!isAuthenticated ? <Auth /> : <Navigate to="/" />} 
        />
        
        {/* Главная страница - Мои видео */}
        <Route 
          path="/" 
          element={<ProtectedRoute><MyVideos /></ProtectedRoute>} 
        />
        
        {/* Страница загрузки нового видео */}
        <Route 
          path="/upload" 
          element={<ProtectedRoute><UploadVideo /></ProtectedRoute>} 
        />

        {/* СТРАНИЦА ПРОСМОТРА ВИДЕО */}
        {/* Параметр :id позволит получать s3Key конкретного ролика */}
        <Route 
          path="/video/:id" 
          element={<ProtectedRoute><VideoPlayerPage /></ProtectedRoute>} 
        />
        
        {/* Страница подписок */}
        <Route 
          path="/subscriptions" 
          element={<ProtectedRoute><div>Страница подписок (в разработке)</div></ProtectedRoute>} 
        />
        
        {/* Редирект для всех несуществующих путей */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;