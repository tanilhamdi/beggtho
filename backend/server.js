import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
const app = express();
const port = process.env.PORT || 4000;

import dotenv from 'dotenv';
dotenv.config();

const dbURI = process.env.MONGO_URI || 'mongodb://localhost:27017/chat-app'; // Fallback to local MongoDB if MONGO_URI is not set


if (!process.env.MONGO_URI) { // Check the env variable itself for clarity
  console.error('Hata: MONGO_URI ortam değişkeni tanımlanmamış. Lütfen .env dosyasını kontrol edin.');
  console.error('Sunucu yerel veritabanına bağlanmayı deneyecek: ' + dbURI); // Inform user about fallback
  // In a production setup, you might want to process.exit(1) here if Atlas is mandatory
}

app.use(express.json());
app.use(cors({
  origin: '*', // Veya sadece senin frontend'inin adresi: 'https://beggtho.vercel.app'
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // ÖNEMLİ: POST metoduna izin verdiğinizden emin olun
  allowedHeaders: ['Content-Type', 'Authorization'], // Eğer başka custom başlıklar kullanıyorsanız ekleyin
}));

mongoose.connect(dbURI)
  .then(function() {
    console.log("mongoose basariyla baglanildi.");

    app.listen(port, () => { console.log(`Server is running on ${port}`); });

  })

const messagesSchema = mongoose.Schema({
  name: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const Messagesdb = mongoose.model("Message", messagesSchema, "messages");

const messages = new Messagesdb(
  { name: 'system', message: "System is workin''''", timestamp: new Date() },
);

app.get('/', (req, res) => {
  res.send('Hello from the server!');
});

app.get('/api/chat', async (req, res) => {
  const allMessages = await Messagesdb.find().sort({ timestamp: 1 });
  res.json(allMessages);
});

const usersSchema = mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true }
});

const UserDB = mongoose.model("User", usersSchema, "users")

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new UserDB({
    username,
    password
  });

  try {
    console.log('Alınan:', newUser);
    const savedUser = await newUser.save();
    console.log("Saved chat is: ", savedUser);
  } catch (error) {
    console.error("Error saving chat:", error);
    res.status(500).json({ error: 'Failed to save message' });
  }

});

app.post('/api/send', async (req, res) => {
  const { name, message } = req.body;

  const newMessage = new Messagesdb({
    name,
    message
  });

  try {
    console.log('Alınan:', newMessage);
    const savedChat = await newMessage.save();
    console.log("Saved chat is: ", savedChat);
  } catch (error) {
    console.error("Error saving chat:", error);
    res.status(500).json({ error: 'Failed to save message' });
  }

});
export default app;
