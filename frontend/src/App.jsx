import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './Auth';
import MyVideos from './MyVideos';
import UploadVideo from './UploadVideo';
import Layout from './Layout'; // Импортируем макет

function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  // Вспомогательный компонент для защищенных страниц с меню
  const ProtectedRoute = ({ children }) => {
    return isAuthenticated ? <Layout>{children}</Layout> : <Navigate to="/auth" />;
  };

  return (
    <Router>
      <Routes>
        <Route path="/auth" element={!isAuthenticated ? <Auth /> : <Navigate to="/" />} />
        
        {/* Все страницы ниже теперь будут с боковым меню */}
        <Route path="/" element={<ProtectedRoute><MyVideos /></ProtectedRoute>} />
        <Route path="/upload" element={<ProtectedRoute><UploadVideo /></ProtectedRoute>} />
        <Route path="/subscriptions" element={<ProtectedRoute><div>Страница подписок (в разработке)</div></ProtectedRoute>} />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;