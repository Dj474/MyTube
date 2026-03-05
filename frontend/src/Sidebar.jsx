import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Video, Users, LogOut } from 'lucide-react';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/auth';
  };

  // Функция для определения стилей элементов навигации
  const navItemStyle = (path) => {
    const isActive = location.pathname === path;
    return {
      display: 'flex',
      alignItems: 'center',
      padding: '12px 20px',
      textDecoration: 'none',
      color: isActive ? '#3b82f6' : '#94a3b8',
      backgroundColor: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
      borderLeft: isActive ? '4px solid #3b82f6' : '4px solid transparent',
      transition: 'all 0.3s ease',
      marginBottom: '4px',
      whiteSpace: 'nowrap',
      overflow: 'hidden'
    };
  };

  return (
    <aside style={{ 
      width: isCollapsed ? '80px' : '260px', 
      height: '100vh', 
      backgroundColor: '#1e293b', 
      borderRight: '1px solid #334155',
      display: 'flex',
      flexDirection: 'column',
      position: 'sticky',
      top: 0,
      left: 0,
      transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)', // Плавная анимация
      zIndex: 1000
    }}>
      {/* Логотип и кнопка управления */}
      <div style={{ 
        padding: '25px 20px', 
        display: 'flex', 
        justifyContent: isCollapsed ? 'center' : 'space-between', 
        alignItems: 'center',
        minHeight: '80px',
        boxSizing: 'border-box'
      }}>
        {!isCollapsed && (
          <span style={{ 
            fontWeight: '800', 
            color: '#3b82f6', 
            fontSize: '1.4rem', 
            letterSpacing: '1px',
            animation: 'fadeIn 0.3s'
          }}>
            MYTUBE
          </span>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)} 
          style={{ 
            background: '#334155', 
            border: 'none', 
            borderRadius: '8px', 
            color: '#f1f5f9', 
            cursor: 'pointer', 
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#475569'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#334155'}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Навигация */}
      <nav style={{ flex: 1, marginTop: '20px' }}>
        <Link to="/" style={navItemStyle('/')}>
          <div style={{ minWidth: '24px', display: 'flex', justifyContent: 'center' }}>
            <Video size={22} />
          </div>
          <span style={{ 
            marginLeft: '15px', 
            opacity: isCollapsed ? 0 : 1, 
            transition: 'opacity 0.2s',
            fontWeight: location.pathname === '/' ? '600' : '400'
          }}>
            Моя студия
          </span>
        </Link>

        <Link to="/subscriptions" style={navItemStyle('/subscriptions')}>
          <div style={{ minWidth: '24px', display: 'flex', justifyContent: 'center' }}>
            <Users size={22} />
          </div>
          <span style={{ 
            marginLeft: '15px', 
            opacity: isCollapsed ? 0 : 1, 
            transition: 'opacity 0.2s',
            fontWeight: location.pathname === '/subscriptions' ? '600' : '400'
          }}>
            Подписки
          </span>
        </Link>
      </nav>

      {/* Футер с кнопкой выхода */}
      <div style={{ padding: '20px', borderTop: '1px solid #334155' }}>
        <button 
          onClick={handleLogout} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            width: '100%', 
            background: 'none', 
            border: 'none', 
            color: '#ef4444', 
            cursor: 'pointer', 
            padding: '12px',
            borderRadius: '8px',
            transition: 'background 0.2s',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
        >
          <div style={{ minWidth: '24px', display: 'flex', justifyContent: 'center' }}>
            <LogOut size={22} />
          </div>
          {!isCollapsed && (
            <span style={{ marginLeft: '15px', fontWeight: '600', opacity: 1 }}>
              Выйти
            </span>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;