import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div style={{ 
      display: 'flex', 
      width: '100vw', 
      height: '100vh', 
      backgroundColor: '#0f172a', // Тёмный фон для всего окна
      overflow: 'hidden' 
    }}>
      <Sidebar />
      <main style={{ 
        flex: 1, 
        backgroundColor: '#0f172a', 
        height: '100vh', 
        overflowY: 'auto', // Прокрутка только для контента
        position: 'relative'
      }}>
        {children}
      </main>
    </div>
  );
};

export default Layout;