import { useState, useEffect } from 'react';
import './App.css';

function Inputbox({ value, className, onChange, id, placeholder, style }) {
  return (
    <input value={value || ''} className={className} style={style} onChange={onChange} id={id} placeholder={placeholder} />
  );
}

function ShortButton({ src, className, url }) {
  const handleClick = () => {
    window.location.href = url; // Aynı sekmede açar
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
  window.location.href = googleSearchUrl; // Google aramasını da aynı sekmede açar
}

function App() {
  const [search, setSearch] = useState('');
  const [messages, setMessages] = useState([]);
  const [sentmes, setSentmes] = useState('');


  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Enter') {
        searchGoogle(search);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [search]);

  useEffect(() => {
    fetch("https://beggtho-server.vercel.app/api/chat")
      .then((res) => res.json())
      .then((data) => {
        setMessages(data);
      })
  }, [messages]);

  const sendMessage = async () => {
    try {
      const response = await fetch("https://beggtho-server.vercel.app/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", },
        body: JSON.stringify({ message: sentmes, name: "Anonim" }),
      });
      const data = await response.json();
      setMessages([...messages, data]);
      setSentmes('');
    } catch (error) {
      console.error("sendMessage hatasi: ", error);
    }
  }


  return (
    <div>
      <div className="tht">
        <h1>BEGGTHO?</h1>
      </div>
      <Inputbox
        placeholder="Bugun Ege ne yarrami yese?"
        onChange={(e) => setSearch(e.target.value)}
        id="inputbox"
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
        <span className='chat'>
          {messages.map((item, index) => (
            <div key={index} style={{ display: 'flex', gap: '5px' }}>
              <span>
                {item.name}:
                {item.message}
                <br />
              </span>
            </div>
          ))}
          <Inputbox value={sentmes} id="msgbox" onChange={(e) => setSentmes(e.target.value)} />
          <button className='sendbtn' onClick={sendMessage}>send</button>
        </span>
      </div>
    </div>
  );
}

export default App;
