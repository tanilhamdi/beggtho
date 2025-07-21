import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './App.css';

// Yardımcı bileşenler (değişiklik yok)
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

  // --- JWT Doğrulama ve Kullanıcı Bilgisini Çekme ---
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
          console.log("Kullanıcı bilgisi çekildi:", data.user.username);
        } else if (response.status === 401 || response.status === 403) {
          console.log('Kullanıcı kimliği doğrulanamadı, giriş sayfasına yönlendiriliyor...');
          navigate('/login');
        } else {
          console.error('Kullanıcı bilgileri çekilirken hata oluştu:', response.status, await response.text());
          setChatError('Kullanıcı bilgileri yüklenemedi. Lütfen tekrar deneyin.');
          navigate('/login');
        }
      } catch (error) {
        console.error('API çağrısı sırasında ağ hatası:', error);
        setChatError('Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.');
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  // --- Sohbet Mesajlarını Çekme ---
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
            console.log("Sohbet geçmişi çekildi:", data);
          } else if (response.status === 401 || response.status === 403) {
            console.log('Sohbet mesajlarına erişim yetkisi yok, giriş sayfasına yönlendiriliyor.');
            navigate('/login');
          } else {
            console.error("Sohbet mesajları çekilirken hata:", response.status, await response.text());
            setChatError('Sohbet mesajları yüklenemedi.');
          }
        } catch (error) {
          console.error("Sohbet mesajları fetch hatası:", error);
          setChatError('Sohbet mesajları yüklenirken bir ağ hatası oluştu.');
        }
      };
      fetchMessages();

      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [isLoading, currentUser, navigate]);

  // --- Sohbet Ekranını Aşağı Kaydırma ---
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  // --- Arama Çubuğu Enter Tuşu İşleyicisi ---
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Enter' && search.trim() !== '') {
        searchGoogle(search);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [search]);

  // --- Mesaj Gönderme İşlevi ---
  const sendMessage = async () => {
    if (!sentmes.trim() || !currentUser) {
      setChatError("Mesaj boş olamaz veya kullanıcı bilgisi yüklenmedi.");
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
        console.log("Mesaj gönderildi:", data);
        setSentmes('');
        setMessages(prevMessages => [...prevMessages, data.chat]);
      } else if (response.status === 401 || response.status === 403) {
        console.log('Mesaj gönderme yetkisi yok, giriş sayfasına yönlendiriliyor.');
        navigate('/login');
      }
      else {
        const errorData = await response.json();
        console.error("Mesaj gönderme hatası:", errorData.message);
        setChatError(errorData.message || 'Mesaj gönderilemedi.');
      }
    } catch (error) {
      console.error("sendMessage sırasında ağ hatası:", error);
      setChatError('Mesaj gönderilirken bir ağ hatası oluştu.');
    }
  };

  // --- Çıkış Yapma İşlevi ---
  const handleLogout = async () => {
    try {
      const response = await fetch('https://beggtho-server.onrender.com/api/logout', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        console.log('Başarıyla çıkış yapıldı.');
        setCurrentUser(null);
        navigate('/login');
      } else {
        console.error('Çıkış yaparken hata oluştu:', response.status, await response.text());
        setChatError('Çıkış yapılırken bir sorun oluştu.');
      }
    } catch (error) {
      console.error('Çıkış işlemi sırasında ağ hatası:', error);
      setChatError('Çıkış yapılırken bir ağ hatası oluştu.');
    }
  };

  if (isLoading) {
    return <div className="loading-screen">Yükleniyor...</div>;
  }

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
        <p>Sohbeti görmek için lütfen giriş yapın.</p>
        <Link to="/login">
          <button>Giriş Yap</button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="button-container">
        {currentUser ? (
          <>
            <span className="welcome-message">Hoş geldin, {currentUser.username}!</span>
            <Bigbutton className="BB" text="Çıkış Yap" onClick={handleLogout} />
          </>
        ) : (
          <>
            <Link to="/login">
              <Bigbutton className="BB" text="Giriş Yap" />
            </Link>
            <Link to="/signin">
              <Bigbutton className="BB" text="Kaydol" />
            </Link>
          </>
        )}
      </div>
      <title>BeggTho</title>
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
        <ShortButton
          className="btns"
          src="youtube.png"
          url="https://www.youtube.com"
        />
        <ShortButton
          className="btns"
          src="https://png.co.ke/wp-content/uploads/2024/05/CITYPNG.COMNetflix-Vector-Flat-Logo-886x885-1.png"
          url="https://www.netflix.com"
        />
        <ShortButton className="btns" url="https://himym-egg.vercel.app/" src="https://img.icons8.com/?size=512&id=7vm2zjnwZxLc&format=png" />
      </div>

      <div className='chat' ref={chatRef}>
        {messages.length === 0 && !isLoading && !chatError ? (
          <p className="no-messages">Henüz mesaj yok. İlk mesajı sen gönder!</p>
        ) : (
          <div className="chat-messages"> {/* Added this wrapper div */}
            {messages.map((item, index) => (
              <div
                key={index}
                className={`chat-message ${item.name === currentUser.username ? 'my-message' : ''}`}
                style={{ '--message-index': index }} // Pass index as a CSS variable for animation delay
              >
                <span className="message-sender">
                  {item.name}:
                </span>
                <span className="message-content">
                  {item.message}
                </span>
                {/* İsterseniz timestamp da ekleyebilirsiniz */}
                {/* <span className="message-timestamp">
                  {new Date(item.timestamp).toLocaleTimeString()}
                </span> */}
              </div>
            ))}
          </div>
        )}
        <div className="message-input-area">
          <input
            value={sentmes}
            id='msgbox'
            onChange={e => setSentmes(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                sendMessage();
              }
            }}
            placeholder={`Mesaj yaz ${currentUser.username}...`}
          />
          <button className='sendbtn' onClick={sendMessage}>Gönder</button>
        </div>
      </div>
    </div>
  );
}

export default App;
