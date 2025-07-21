import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // useNavigate ekledik
import './App.css';

// Yardımcı bileşenler (değişiklik yok)
function Inputbox({ className, onChange, id, placeholder, style }) {
  return (
    <input className={className} style={style} onChange={onChange} id={id} placeholder={placeholder} />
  );
}

function Bigbutton({ className, text, onClick }) { // onClick prop'u eklendi
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
  const [currentUser, setCurrentUser] = useState(null); // Giriş yapan kullanıcı bilgisi
  const [isLoading, setIsLoading] = useState(true); // Yüklenme durumu
  const [chatError, setChatError] = useState(''); // Sohbet hataları için
  const chatRef = useRef(null); // Reference to the chat container
  const navigate = useNavigate(); // Yönlendirme için

  // --- JWT Doğrulama ve Kullanıcı Bilgisini Çekme ---
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Backend'deki /api/me endpoint'ine istek at
        const response = await fetch('https://beggtho-server.onrender.com/api/me', {
          method: 'GET',
          credentials: 'include' // Cookie'lerin otomatik gönderilmesi için kritik
        });

        if (response.ok) {
          const data = await response.json();
          setCurrentUser(data.user); // Kullanıcı bilgisini state'e kaydet
          console.log("Kullanıcı bilgisi çekildi:", data.user.username);
        } else if (response.status === 401 || response.status === 403) {
          // Token yoksa veya geçersizse (yani kullanıcı giriş yapmamışsa)
          console.log('Kullanıcı kimliği doğrulanamadı, giriş sayfasına yönlendiriliyor...');
          navigate('/login'); // Giriş sayfasına yönlendir
        } else {
          console.error('Kullanıcı bilgileri çekilirken hata oluştu:', response.status, await response.text());
          setChatError('Kullanıcı bilgileri yüklenemedi. Lütfen tekrar deneyin.');
          navigate('/login'); // Hata durumunda da giriş sayfasına yönlendirme
        }
      } catch (error) {
        console.error('API çağrısı sırasında ağ hatası:', error);
        setChatError('Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.');
        navigate('/login'); // Ağ hatasında da giriş sayfasına yönlendirme
      } finally {
        setIsLoading(false); // Yükleme tamamlandı
      }
    };

    fetchUserData();
  }, [navigate]); // navigate bağımlılık listesinde olmalı

  // --- Sohbet Mesajlarını Çekme ---
  useEffect(() => {
    // Sadece kullanıcı bilgisi yüklendikten sonra mesajları çek
    if (!isLoading && currentUser) {
      const fetchMessages = async () => {
        try {
          const response = await fetch("https://beggtho-server.onrender.com/api/chat", {
            method: 'GET',
            credentials: 'include' // Cookie'leri göndermek için
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
      fetchMessages(); // İlk yüklemede çek

      // Düzenli aralıklarla mesajları çek
      const interval = setInterval(fetchMessages, 5000); // Her 5 saniyede bir çek
      return () => clearInterval(interval); // Bileşen kaldırıldığında interval'i temizle
    }
  }, [isLoading, currentUser, navigate]); // isLoading ve currentUser değiştiğinde yeniden çalış

  // --- Sohbet Ekranını Aşağı Kaydırma ---
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]); // Mesajlar değiştiğinde aşağı kaydır

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
    if (!sentmes.trim() || !currentUser) { // Mesaj boşsa veya kullanıcı bilgisi yoksa gönderme
      setChatError("Mesaj boş olamaz veya kullanıcı bilgisi yüklenmedi.");
      return;
    }

    try {
      const response = await fetch("https://beggtho-server.onrender.com/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include', // Cookie'leri göndermek için kritik
        body: JSON.stringify({ message: sentmes }), // Backend artık 'name'i JWT'den alıyor
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Mesaj gönderildi:", data);
        // Mesaj gönderildikten sonra mesaj kutusunu temizle
        setSentmes('');
        // Mesajları tekrar çekerek sohbeti güncelle (veya optimistik güncelleme yapabilirsiniz)
        // Mevcut yapınızda interval zaten güncelliyor, ancak anında görmek için tekrar çekmek iyi bir pratik.
        // Optimistik güncelleme, mesajı backend onaylamadan önce UI'da göstermektir.
        // Bu durumda, response.ok ise messages state'ine yeni mesajı ekleyebiliriz:
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
        credentials: 'include' // Cookie'yi silmek için gerekli
      });

      if (response.ok) {
        console.log('Başarıyla çıkış yapıldı.');
        setCurrentUser(null); // Kullanıcı bilgisini temizle
        navigate('/login'); // Giriş sayfasına yönlendir
      } else {
        console.error('Çıkış yaparken hata oluştu:', response.status, await response.text());
        setChatError('Çıkış yapılırken bir sorun oluştu.');
      }
    } catch (error) {
      console.error('Çıkış işlemi sırasında ağ hatası:', error);
      setChatError('Çıkış yapılırken bir ağ hatası oluştu.');
    }
  };

  // Kullanıcı bilgileri yüklenene kadar veya hata varsa yükleme ekranı göster
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

  // Kullanıcı giriş yapmamışsa (authenticateToken redirect'i çalışırsa)
  // Bu kontrol aslında `Maps('/login')` çağrısı sayesinde gereksiz hale gelir,
  // ancak ekstra güvenlik için bırakılabilir.
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
        {/* Kullanıcı giriş yapmışsa Giriş/Kayıt butonlarını gizleyebiliriz
                    veya Sadece Çıkış butonunu gösterebiliriz. */}
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
        value={search} // Controlled component
      />
      <div className="buttons-container">
        <ShortButton
          className="btns"
          src="youtube.png" // Bu resmin public klasöründe olduğundan emin olun
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
          messages.map((item, index) => (
            <div key={index} className={`chat-message ${item.name === currentUser.username ? 'my-message' : ''}`}>
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
          ))
        )}
        <div className="message-input-area">
          <input
            value={sentmes}
            id='msgbox'
            onChange={e => setSentmes(e.target.value)}
            onKeyPress={(e) => { // Enter tuşu ile gönderme
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
