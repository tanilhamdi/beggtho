import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import "./App.css";

function Inputbox({ type, onChange, className }) {
  return (
    <input type={type} onChange={onChange} className={className}></input>
  );
}

function Signup() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSignup = async () => {
    setErrorMessage('');

    try {
      const response = await fetch("https://beggtho-server.onrender.com/api/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Kayıt başarılı:", data.message);
        navigate('/'); // **BURASI DEĞİŞTİ: Ana sayfaya yönlendiriyoruz**
      } else {
        const errorData = await response.json();
        console.error("Kayıt hatası:", errorData.message);
        setErrorMessage(errorData.message || 'Kayıt başarısız oldu. Lütfen tekrar deneyin.');
      }
    } catch (error) {
      console.error("Ağ hatası veya sunucuya ulaşılamıyor:", error);
      setErrorMessage('Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.');
    }
  };

  return (
    <div className='spanOfLogin'>
      <div className='loginTitle'>
        <b>Kaydol</b>
      </div>
      <br />
      Kullanıcı Adı
      <Inputbox
        className="linput"
        onChange={(e) => setUsername(e.target.value)}
        type="text"
        value={username}
      />
      <br />
      Şifre
      <Inputbox
        className="linput"
        type="password"
        onChange={(e) => setPassword(e.target.value)}
        value={password}
      />
      <br />
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <button id="lgin" onClick={handleSignup}>Kaydol</button>
      <p>Zaten hesabın var mı? <Link to="/login">Giriş Yap</Link></p>
    </div>
  );
}

export default Signup;
