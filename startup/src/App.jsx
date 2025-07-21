import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './App.css';

function Inputbox({ className, onChange, id, placeholder, style }) {
  return (
    <input className={className} style={style} onChange={onChange} id={id} placeholder={placeholder} />
  );
}

function Bigbutton({ className, text, onClick }) {
  return (
    <button className={className} onClick={onClick}>{text}</button>
  )
}

function ShortButton({ src, className, url }) {
  const handleClick = () => {
    window.location.href = url;
  };
  return (
    <button className={className} onClick={handleClick}>
      <img src={src} alt="Button Icon" />
    </button>
  );
}

function searchGoogle(query) {
  const encodedQuery = encodeURIComponent(query);
  const googleSearchUrl = `https://www.google.com/search?q=${encodedQuery}`;
  window.location.href = googleSearchUrl;
}

function App() {
  const [search, setSearch] = useState('');
  const [messages, setMessages] = useState([]);
  const [sentmes, setSentmes] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chatError, setChatError] = useState('');
  const chatRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('https://beggtho-server.onrender.com/api/me', {
          method: 'GET',
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          setCurrentUser(data.user);
        } else {
          navigate('/login');
        }
      } catch (error) {
        setChatError('Sunucuya bağlanılamadı.');
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  useEffect(() => {
    if (!isLoading && currentUser) {
      const fetchMessages = async () => {
        try {
          const response = await fetch("https://beggtho-server.onrender.com/api/chat", {
            method: 'GET',
            credentials: 'include'
          });
          if (response.ok) {
            const data = await response.json();
            setMessages(data);
          } else {
            navigate('/login');
          }
        } catch (error) {
          setChatError('Mesajlar alınamadı.');
        }
      };
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [isLoading, currentUser, navigate]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Enter' && search.trim() !== '') {
        searchGoogle(search);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [search]);

  const sendMessage = async () => {
    if (!sentmes.trim() || !currentUser) {
      setChatError("Mesaj boş olamaz.");
      return;
    }

    try {
      const response = await fetch("https://beggtho-server.onrender.com/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ message: sentmes }),
      });

      if (response.ok) {
        const data = await response.json();
        setSentmes('');
        setMessages(prevMessages => [...prevMessages, data.chat]);
      } else {
        setChatError('Mesaj gönderilemedi.');
      }
    } catch (error) {
      setChatError('Mesaj gönderilirken hata oluştu.');
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('https://beggtho-server.onrender.com/api/logout', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        setCurrentUser(null);
        navigate('/login');
      } else {
        setChatError('Çıkış yapılamadı.');
      }
    } catch (error) {
      setChatError('Çıkış yapılırken hata oluştu.');
    }
  };

  if (isLoading) return <div className="loading-screen">Yükleniyor...</div>;

  if (chatError) {
    return (
      <div className="error-screen">
        <h2>Hata Oluştu!</h2>
        <p>{chatError}</p>
        <button onClick={() => navigate('/login')}>Giriş Sayfasına Git</button>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="not-logged-in-screen">
        <h2>Giriş Yapmadınız</h2>
        <Link to="/login">
          <button>Giriş Yap</button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="button-container">
        <span className="welcome-message">Hoş geldin, {currentUser.username}!</span>
        <Bigbutton className="BB" text="Çıkış Yap" onClick={handleLogout} />
      </div>

      <div className="tht">
        <h1>BEGGTHO?</h1>
      </div>

      <Inputbox
        placeholder="Bugun Ege ne yarrami yese?"
        onChange={(e) => setSearch(e.target.value)}
        id="inputbox"
        value={search}
      />

      <div className="buttons-container">
        <ShortButton className="btns" src="youtube.png" url="https://www.youtube.com" />
        <ShortButton className="btns" src="https://png.co.ke/wp-content/uploads/2024/05/CITYPNG.COMNetflix-Vector-Flat-Logo-886x885-1.png" url="https://www.netflix.com" />
        <ShortButton className="btns" src="https://img.icons8.com/?size=512&id=7vm2zjnwZxLc&format=png" url="https://himym-egg.vercel.app/" />
      </div>

      <div className='chat' ref={chatRef}>
        {messages.length === 0 ? (
          <p className="no-messages">Henüz mesaj yok. İlk mesajı sen gönder!</p>
        ) : (
          messages.map((item, index) => (
            <div key={index} className={`chat-message ${item.name === currentUser.username ? 'my-message' : ''}`}>
              <span className="message-sender">{item.name}:</span>
              <span className="message-content">{item.message}</span>
            </div>
          ))
        )}
        <div className="message-input-area">
          <input
            value={sentmes}
            id='msgbox'
            onChange={e => setSentmes(e.target.value)}
            onKeyPress={(e) => { if (e.key === 'Enter') sendMessage(); }}
            placeholder={`Mesaj yaz ${currentUser.username}...`}
          />
          <button className='sendbtn' onClick={sendMessage}>Gönder</button>
        </div>
      </div>
    </div>
  );
}

export default App;

