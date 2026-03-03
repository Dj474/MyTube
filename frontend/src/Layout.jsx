import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, UserCircle, LogOut } from 'lucide-react';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Навигация: убрали "Загрузить", переименовали "Главную"
  const menuItems = [
    { name: 'Моя студия', icon: <LayoutDashboard size={20} />, path: '/' },
    { name: 'Подписки', icon: <Users size={20} />, path: '/subscriptions' },
    { name: 'Мой профиль', icon: <UserCircle size={20} />, path: '/profile' },
  ];

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/auth';
  };

  return (
    <div style={{ display: 'flex', backgroundColor: '#0f172a', minHeight: '100vh' }}>
      
      {/* SIDEBAR */}
      <div style={{ 
        width: '260px', 
        borderRight: '1px solid #1e293b', 
        padding: '24px 16px', 
        position: 'fixed', 
        height: '100vh',
        display: 'flex',
        flexDirection: 'column' // Чтобы работало marginTop: 'auto' для кнопки выхода
      }}>
        <div style={{ 
          color: '#3b82f6', 
          fontSize: '1.4rem', 
          fontWeight: 'bold', 
          marginBottom: '32px', 
          paddingLeft: '12px',
          letterSpacing: '0.5px'
        }}>
          VIDEO SERVICE
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <div
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: '0.2s',
                  backgroundColor: isActive ? '#1e3a8a' : 'transparent',
                  color: isActive ? '#f1f5f9' : '#94a3b8'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = '#1e293b';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {item.icon}
                <span style={{ fontWeight: isActive ? '600' : '400' }}>{item.name}</span>
              </div>
            );
          })}
        </nav>

        {/* Кнопка "Выйти" строго внизу */}
        <div
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            marginTop: 'auto', // Выталкивает кнопку вниз
            borderRadius: '10px',
            cursor: 'pointer',
            color: '#ef4444',
            transition: '0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <LogOut size={20} />
          <span style={{ fontWeight: '500' }}>Выйти</span>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={{ marginLeft: '260px', flex: 1, backgroundColor: '#0f172a' }}>
        {children}
      </div>
    </div>
  );
};

export default Layout;