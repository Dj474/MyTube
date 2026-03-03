import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './Auth';
import MyVideos from './MyVideos';
import UploadVideo from './UploadVideo';
import VideoPlayerPage from './VideoPlayerPage'; 
import ProfilePage from './ProfilePage';
import Subscriptions from './Subscriptions'; // Импортируем новый компонент
import Layout from './Layout';

function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  const ProtectedRoute = ({ children }) => {
    return isAuthenticated ? <Layout>{children}</Layout> : <Navigate to="/auth" />;
  };

  return (
    <Router>
      <Routes>
        <Route path="/auth" element={!isAuthenticated ? <Auth /> : <Navigate to="/" />} />
        
        <Route path="/" element={<ProtectedRoute><MyVideos /></ProtectedRoute>} />
        <Route path="/upload" element={<ProtectedRoute><UploadVideo /></ProtectedRoute>} />
        <Route path="/video/:id" element={<ProtectedRoute><VideoPlayerPage /></ProtectedRoute>} />
        <Route path="/profile/:userId" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        
        {/* ТЕПЕРЬ ТУТ НЕ ТЕКСТ, А КОМПОНЕНТ */}
        <Route path="/subscriptions" element={<ProtectedRoute><Subscriptions /></ProtectedRoute>} />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;