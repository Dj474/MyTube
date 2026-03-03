import React, { useState } from 'react';
import axios from 'axios';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', username: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const endpoint = isLogin ? 'signin' : 'register';
    const url = `http://localhost:8090/api/v1/auth/${endpoint}`;

    try {
      console.log(`Отправка запроса на ${endpoint}...`);
      const response = await axios.post(url, formData);
      
      console.log("Ответ сервера:", response.data);

      const { accessToken, refreshToken, id } = response.data;

      if (accessToken) {
        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', refreshToken); 
        localStorage.setItem('userId', id);
        
        console.log("Успех! Переходим в Студию.");
        window.location.href = '/'; 
      } else if (!isLogin) {
        alert("Регистрация успешна! Теперь используйте свои данные для входа.");
        setIsLogin(true);
      }
    } catch (err) {
      console.error("Ошибка авторизации:", err);
      const message = err.response?.data?.message || "Неверный логин или пароль";
      alert(message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">
          {isLogin ? 'Вход в MyTube' : 'Регистрация'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="input-group">
              <label>Имя пользователя</label>
              <input 
                type="text" 
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})} 
                placeholder="Ivan_Ivanov"
                required 
              />
            </div>
          )}
          
          <div className="input-group">
            {/* Меняем лейбл для наглядности */}
            <label>{isLogin ? 'Email или Имя пользователя' : 'Email'}</label>
            <input 
              /* ВАЖНО: type="text" убирает встроенную проверку браузера на @ */
              type="text" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})} 
              placeholder={isLogin ? "example@mail.com или username" : "example@mail.com"}
              required 
            />
          </div>
          
          <div className="input-group">
            <label>Пароль</label>
            <input 
              type="password" 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})} 
              placeholder="••••••••"
              required 
            />
          </div>
          
          <button type="submit" className="blue-btn">
            {isLogin ? 'Войти' : 'Создать аккаунт'}
          </button>
        </form>
        
        <p className="toggle-link" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? 'Нет аккаунта? Зарегистрируйтесь' : 'Уже есть аккаунт? Войдите'}
        </p>
      </div>
    </div>
  );
};

export default Auth;