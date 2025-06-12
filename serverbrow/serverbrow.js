const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors(
  {
    origin: 'https://beggtho.vercel.app',
    methods: ['GET', 'POST'],
  }
));

const messages = [
  { name: 'unram', message: 'cemre was my angle...' },
];

app.get('/', (req, res) => {
  res.send('Server is running');
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

module.exports = app;
