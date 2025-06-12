import { useState, useEffect, useRef } from 'react';
import './App.css';

function Inputbox({ value, className, onChange, id, placeholder, style }) {
  return (
    <input className={className} style={style} onChange={onChange} id={id} placeholder={placeholder} />
  );
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
  const chatRef = useRef(null); // Reference to the chat container

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Enter' && search.trim() !== '') {
        searchGoogle(search);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [search]);

  useEffect(() => {
    fetch("https://beggtho.vercel.app/api/chat")
      .then((res) => {
        console.log("Fetch status:", res.status);
        return res.json();
      })
      .then((data) => {
        console.log("Fetched data:", data);
        setMessages(data);
      })
      .catch((error) => console.error("Fetch error:", error));
  }, []);

  useEffect(() => {
    // Scroll to the bottom of the chat when messages change
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetch("https://beggtho.vercel.app/api/chat")
        .then((res) => res.json())
        .then((data) => {
          setMessages(data);
          console.log("Fetched data in interval:", data);
        })
        .catch((error) => console.error("Fetch error:", error));
    }, 10000); // Fetch every 10 seconds
  }, []);

  const sendMessage = async () => {
    try {
      const response = await fetch("https://beggtho.vercel.app/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: sentmes, name: "Anonim" }),
      });
      console.log("Send response status:", response.status);
      const data = await response.json();
      console.log("Send data:", data);
      setMessages([...messages, data]);
      setSentmes('');
    } catch (error) {
      console.error("sendMessage hatasi:", error);
    }
  };

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
        <div className='chat' ref={chatRef}>
          {messages.map((item, index) => (
            <div key={index} style={{ display: 'flex', gap: '5px' }}>
              <span>
                {item.name}: {item.message}
                <br />
              </span>
            </div>
          ))}
          <input value={sentmes} id='msgbox' onChange={e => setSentmes(e.target.value)} />
          <button className='sendbtn' onClick={sendMessage}>send</button>
        </div>
      </div>
    </div>
  );
}

export default App;
