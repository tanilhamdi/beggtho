import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './App.css';


function Inputbox({ className, onChange, id, placeholder, style }) {
  return (
    <input className={className} style={style} onChange={onChange} id={id} placeholder={placeholder} />
  );
}

function Bigbutton({ className, text }) {
  return (
    <button className={className}>{text}</button>
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
    fetch("https://beggtho-server.onrender.com/api/chat")
      .then((res) => {
        console.log("Fetch status:", res.status);
        return res.json();
      })
      .then((data) => {
        console.log("Fetched data:", data);
        setMessages(data);
        // Trigger scroll after initial fetch and setMessages
        if (chatRef.current) {
          chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
      })
      .catch((error) => console.error("Fetch error:", error));
  }, []); // Empty dependency array means this runs ONCE on component mount

  // This useEffect will run whenever 'messages' state changes,
  // including after the initial fetch and subsequent interval fetches/sends.
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]); // <-- Dependency array changed to [messages]

  useEffect(() => {
    const interval = setInterval(() => {
      fetch("https://beggtho-server.onrender.com/api/chat")
        .then((res) => res.json())
        .then((data) => {
          setMessages(data);
          console.log("Fetched data in interval:", data);
        })
        .catch((error) => console.error("Fetch error:", error));
    }, 5000); // Fetch every 5 seconds
    return () => clearInterval(interval); // Clear interval on unmount
  }, []);

  const sendMessage = async () => {
    try {
      const response = await fetch("https://beggtho-server.onrender.com/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: sentmes, name: "Anonim" }),
      });
      console.log("Send response status:", response.status);
      const data = await response.json();
      console.log("Send data:", data);
      // setMessages([...messages, data]); // This will trigger the scroll useEffect
      // It's usually better to refetch all messages after sending for consistency
      // if your backend doesn't return the full updated list.
      // Or, add the new message directly and then refetch in a moment.
      // For simplicity, let's trigger a refetch immediately or wait for the interval.
      // A common pattern is:
      setMessages(prevMessages => [...prevMessages, { name: "Anonim", message: sentmes }]); // Optimistic update
      setSentmes(''); // Clear input immediately
      // Then, either wait for the 5-second interval to sync, or
      // trigger a manual fetch here:
      fetch("https://beggtho-server.onrender.com/api/chat")
        .then(res => res.json())
        .then(data => setMessages(data))
        .catch(error => console.error("Refetch after send error:", error));


    } catch (error) {
      console.error("sendMessage hatasi:", error);
    }
  };


  return (
    <div>
      <div className="button-container">
        <Link to="/login">
          <Bigbutton className="BB" text="Log in" />
        </Link>
        <Bigbutton className="BB" text="Sign up" />

      </div>
      <title>BeggTho</title>
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
        <ShortButton className="btns" url="https://himym-egg.vercel.app/" src="https://img.icons8.com/?size=512&id=7vm2zjnwZxLc&format=png" />
        <div className='chat' ref={chatRef}> {/* Ensure this ref is attached */}
          {messages.map((item, index) => (
            <div key={index} style={{ display: 'flex', gap: '5px' }}>
              <span>
                {item.name}: {item.message}
                <br />
              </span>
            </div>
          ))}
          <div className="message-input-area"> {/* Added this wrapper based on your CSS */}
            <input value={sentmes} id='msgbox' onChange={e => setSentmes(e.target.value)} />
            <button className='sendbtn' onClick={sendMessage}>send</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
