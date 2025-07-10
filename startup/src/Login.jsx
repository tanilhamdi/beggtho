import React, { useEffect, useState } from 'react';
import "./App.css";

function Inputbox({ type, onChange, className }) {
  return (
    <input type={type} onChange={onChange} className={className}></input>
  );
}


function Login() {

  const [sentusername, setUsername] = useState('');
  const [sentpassword, setPassword] = useState('');

  const sendUser = async () => {
    try {
      const response = await fetch("https://beggtho.onrender.com/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: sentusername, password: sentpassword }),
      })
      console.log("Send response status:", response.status);
      const data = await response.json();
      console.log("Send data:", data);

    } catch {
      console.log("bla bla")
    }
  };

  return (
    <div className='spanOfLogin'>
      <div className='loginTitle'>
        <b>
          Log in
        </b>
      </div>
      <br />
      E-Mail
      <Inputbox className="linput" onChange={(e) => setUsername(e.target.value)} type="text" />
      <br />
      Password
      <Inputbox className="linput" type="password" onChange={(e) => setPassword(e.target.value)} />
      <br />
      <button id="lgin" onClick={sendUser}>Log in</button>
    </div>
  );
}

export default Login;
