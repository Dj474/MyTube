import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './Auth';
import MyVideos from './MyVideos';
import UploadVideo from './UploadVideo';
import VideoPlayerPage from './VideoPlayerPage'; 
import ProfilePage from './ProfilePage';
import Subscriptions from './Subscriptions';
import SearchPage from './SearchPage'; 
import Layout from './Layout';
import HistoryPage from './HistoryPage';
import RecommendationsPage from './RecommendationsPage';

// Импорты страниц плейлистов
import PlaylistsPage from './PlaylistsPage';
import PlaylistDetailsPage from './PlaylistDetailsPage';

function App() {
  // Проверка авторизации (токен в localStorage)
  const isAuthenticated = !!localStorage.getItem('token');

  // Обертка для защищенных страниц (включает Layout)
  const ProtectedRoute = ({ children }) => {
    return isAuthenticated ? <Layout>{children}</Layout> : <Navigate to="/auth" />;
  };

  return (
    <Router>
      <Routes>
        {/* АВТОРИЗАЦИЯ */}
        <Route 
          path="/auth" 
          element={!isAuthenticated ? <Auth /> : <Navigate to="/" />} 
        />
        
        {/* ГЛАВНАЯ (МОИ ВИДЕО / СТУДИЯ) */}
        <Route path="/" element={<ProtectedRoute><MyVideos /></ProtectedRoute>} />
        
        {/* ПОИСК */}
        <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
        
        {/* ЗАГРУЗКА ВИДЕО */}
        <Route path="/upload" element={<ProtectedRoute><UploadVideo /></ProtectedRoute>} />
        
        {/* ПРОСМОТР ВИДЕО */}
        <Route path="/video/:id" element={<ProtectedRoute><VideoPlayerPage /></ProtectedRoute>} />
        
        {/* ПРОФИЛЬ */}
        <Route path="/profile/:userId" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        
        {/* СОЦИАЛЬНЫЕ ФУНКЦИИ */}
        <Route path="/subscriptions" element={<ProtectedRoute><Subscriptions /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
        <Route path="/recommendations" element={<ProtectedRoute><RecommendationsPage /></ProtectedRoute>} />
        
        {/* --- ПЛЕЙЛИСТЫ (Теперь под защитой и в Layout) --- */}
        <Route path="/playlists" element={<ProtectedRoute><PlaylistsPage /></ProtectedRoute>} />
        <Route path="/playlist/:playlistId" element={<ProtectedRoute><PlaylistDetailsPage /></ProtectedRoute>} />

        {/* ОБРАБОТКА 404 */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;