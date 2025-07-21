import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import "./App.css";

function Inputbox({ type, onChange, className }) {
  return (
    <input type={type} onChange={onChange} className={className}></input>
  );
}

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    setErrorMessage('');

    try {
      const response = await fetch("https://beggtho-server.onrender.com/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Giriş başarılı:", data.message);
        navigate('/'); // **BURASI DEĞİŞTİ: Ana sayfaya yönlendiriyoruz**
      } else {
        const errorData = await response.json();
        console.error("Giriş hatası:", errorData.message);
        setErrorMessage(errorData.message || 'Giriş başarısız oldu. Lütfen tekrar deneyin.');
      }
    } catch (error) {
      console.error("Ağ hatası veya sunucuya ulaşılamıyor:", error);
      setErrorMessage('Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.');
    }
  };

  return (
    <div className='spanOfLogin'>
      <div className='loginTitle'>
        <b>Log in</b>
      </div>
      <br />
      E-Mail (Kullanıcı Adı)
      <Inputbox
        className="linput"
        onChange={(e) => setUsername(e.target.value)}
        type="text"
        value={username}
      />
      <br />
      Password
      <Inputbox
        className="linput"
        type="password"
        onChange={(e) => setPassword(e.target.value)}
        value={password}
      />
      <br />
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <button id="lgin" onClick={handleLogin}>Log in</button>
      <p>Hesabın yok mu? <Link to="/signin">Şimdi kaydol</Link></p>
    </div>
  );
}

export default Login;
