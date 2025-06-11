const express = require('express');
const app = express();

app.use(express.json());

const messages = [{
  name: "unram",
  message: "cemre was my angle..."
}];


app.get('/api/chat', (req, res) => {
  res.json(messages);
});

app.post('/api/send', (req, res) => {
  const newMessage = req.body;
  messages.push(newMessage);
  console.log(newMessage);
  res.json(newMessage);
});

app.listen(3000, '0.0.0.0', () => {
  console.log("Listening 3000 port");
});







