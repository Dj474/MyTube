import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, UserCircle, LogOut, Search, Clock, Sparkles } from 'lucide-react'; 
import { useState } from 'react';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const menuItems = [
    { name: 'Рекомендации', icon: <Sparkles size={20} />, path: '/recommendations' },
    { name: 'Моя студия', icon: <LayoutDashboard size={20} />, path: '/' },
    { name: 'Подписки', icon: <Users size={20} />, path: '/subscriptions' },
    { name: 'История', icon: <Clock size={20} />, path: '/history' },
    { name: 'Мой профиль', icon: <UserCircle size={20} />, path: '/profile' },
  ];

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/auth';
  };

  return (
    // Добавлено overflowX: 'hidden', чтобы не было горизонтальной полосы
    <div style={{ display: 'flex', backgroundColor: '#0f172a', minHeight: '100vh', overflowX: 'hidden' }}>
      
      {/* SIDEBAR */}
      <div style={{ 
        width: '260px', borderRight: '1px solid #1e293b', padding: '24px 16px', 
        position: 'fixed', height: '100vh', display: 'flex', flexDirection: 'column',
        zIndex: 20 // Сайдбар всегда сверху
      }}>
        <div style={{ color: '#3b82f6', fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '32px', paddingLeft: '12px' }}>
          MYTYBE
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <div
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '12px',
                  borderRadius: '10px', cursor: 'pointer', transition: '0.2s',
                  backgroundColor: isActive ? '#1e3a8a' : 'transparent',
                  color: isActive ? '#f1f5f9' : '#94a3b8'
                }}
              >
                {item.icon}
                <span style={{ fontWeight: isActive ? '600' : '400' }}>{item.name}</span>
              </div>
            );
          })}
        </nav>

        <div onClick={handleLogout} style={{ 
          display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', 
          marginTop: 'auto', borderRadius: '10px', cursor: 'pointer', color: '#ef4444' 
        }}>
          <LogOut size={20} />
          <span style={{ fontWeight: '500' }}>Выйти</span>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={{ 
        marginLeft: '260px', 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        minHeight: '100vh', // Гарантируем высоту
        position: 'relative' // Для корректного позиционирования header
      }}>
        <header style={{ 
          height: '70px', borderBottom: '1px solid #1e293b', display: 'flex', 
          alignItems: 'center', padding: '0 40px', 
          position: 'sticky', top: 0, 
          backgroundColor: '#0f172a', zIndex: 10 
        }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '600px' }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input 
              type="text"
              placeholder="Поиск видео или авторов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              style={{
                width: '100%', backgroundColor: '#1e293b', border: '1px solid #334155',
                borderRadius: '24px', padding: '10px 20px 10px 48px', color: 'white',
                outline: 'none', fontSize: '0.95rem'
              }}
            />
          </div>
        </header>

        {/* Секция main теперь будет растягиваться и толкать страницу вниз, создавая скролл */}
        <main style={{ padding: '40px', flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;