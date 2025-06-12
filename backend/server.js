const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(cors()); // Netlify için tüm origin’lere izin (geliştirme)

const messages = [
  { name: 'unram', message: 'cemre was my angle...' },
];

app.get('/', (req, res) => {
  res.send('Hello from the server!');
});

app.get('/api/chat', (req, res) => {
  res.json(messages);
});

app.post('/api/send', (req, res) => {
  const newMessage = req.body;
  messages.push(newMessage);
  console.log('Alınan:', newMessage);
  res.json(newMessage);
});


exports.handler = app;
