import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('Hata: JWT_SECRET ortam değişkeni tanımlanmamış. Lütfen .env dosyasını kontrol edin.');
  process.exit(1);
}

const dbURI = process.env.MONGO_URI || 'mongodb://localhost:27017/chat-app';

if (!process.env.MONGO_URI) {
  console.error('Hata: MONGO_URI ortam değişkeni tanımlanmamış. Lütfen .env dosyasını kontrol edin.');
  console.error('Sunucu yerel veritabanına bağlanmayı deneyecek: ' + dbURI);
}

// --- Middleware'ler ---
app.use(express.json());
app.use(cookieParser());

app.use(cors({
  // Burası güncellendi: Frontend'inizin Render üzerindeki URL'i
  origin: process.env.NODE_ENV === 'production' ? 'https://beggtho-frontend.onrender.com' : 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

mongoose.connect(dbURI)
  .then(() => {
    console.log("Mongoose başarıyla bağlandı.");
    app.listen(port, () => {
      console.log(`Server is running on ${port}`);
    });
  })
  .catch(err => {
    console.error("MongoDB bağlantı hatası:", err);
    process.exit(1);
  });

// --- Schemas and Models ---
const messagesSchema = mongoose.Schema({
  name: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});
const Messagesdb = mongoose.model("Message", messagesSchema, "messages");

const usersSchema = mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const UserDB = mongoose.model("User", usersSchema, "users");


// --- Middleware: JWT Doğrulama ---
function authenticateToken(req, res, next) {
  const token = req.cookies.jwt;

  if (!token) {
    return res.status(401).json({ message: 'Yetkisiz erişim: Kimlik doğrulama tokenı bulunamadı.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error("JWT doğrulama hatası:", err.message);
      return res.status(403).json({ message: 'Geçersiz veya süresi dolmuş kimlik doğrulama tokenı.' });
    }
    req.user = user;
    next();
  });
}

// --- Rotas ---

app.get('/', (req, res) => {
  res.send('Hello from the server!');
});

app.get('/api/chat', authenticateToken, async (req, res) => {
  try {
    const allMessages = await Messagesdb.find().sort({ timestamp: 1 });
    res.json(allMessages);
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Kullanıcı adı ve şifre gerekli.' });
  }

  try {
    const user = await UserDB.findOne({ username });

    if (!user) {
      console.log(`Login attempt for non-existent user: ${username}`);
      return res.status(401).json({ message: 'Geçersiz kullanıcı adı veya şifre.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log(`Login attempt with wrong password for user: ${username}`);
      return res.status(401).json({ message: 'Geçersiz kullanıcı adı veya şifre.' });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 3600000
    });

    console.log(`User '${username}' başarıyla giriş yaptı ve JWT cookie'si ayarlandı.`);
    res.status(200).json({ message: 'Giriş başarılı!', user: { id: user._id, username: user.username } });

  } catch (error) {
    console.error("Giriş işlemi sırasında hata:", error);
    res.status(500).json({ message: 'Giriş işlemi sırasında sunucu hatası oluştu. Lütfen tekrar deneyin.' });
  }
});

app.post('/api/signin', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Kullanıcı adı ve şifre gerekli.' });
  }

  try {
    const existingUser = await UserDB.findOne({ username });
    if (existingUser) {
      console.log(`Kayıt denemesi: Kullanıcı adı zaten mevcut: ${username}`);
      return res.status(409).json({ message: 'Kullanıcı adı zaten mevcut. Lütfen farklı bir tane seçin.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new UserDB({
      username,
      password: hashedPassword
    });

    const savedUser = await newUser.save();
    console.log("Yeni kullanıcı başarıyla kaydedildi:", savedUser.username);

    const token = jwt.sign(
      { id: savedUser._id, username: savedUser.username },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 3600000
    });

    res.status(201).json({
      message: 'Kullanıcı başarıyla kaydedildi!',
      user: { id: savedUser._id, username: savedUser.username }
    });

  } catch (error) {
    console.error("Kullanıcı kaydı (signin) sırasında hata:", error);
    res.status(500).json({ message: 'Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.' });
  }
});

app.post('/api/send', authenticateToken, async (req, res) => {
  const name = req.user.username;
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ message: 'Mesaj içeriği gerekli.' });
  }

  const newMessage = new Messagesdb({
    name,
    message,
    timestamp: new Date()
  });

  try {
    console.log('Alınan mesaj (gönderen:', name + '):', newMessage.message);
    const savedMessage = await newMessage.save();
    console.log("Kaydedilen mesaj:", savedMessage);
    res.status(201).json({ message: 'Mesaj başarıyla gönderildi!', chat: savedMessage });
  } catch (error) {
    console.error("Mesaj kaydetme hatası:", error);
    res.status(500).json({ error: 'Mesaj kaydedilemedi.' });
  }
});

app.post('/api/logout', (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    expires: new Date(0)
  });
  console.log("Kullanıcı çıkış yaptı ve JWT cookie'si silindi.");
  res.json({ message: 'Çıkış başarılı.' });
});

app.get('/api/me', authenticateToken, (req, res) => {
  res.json({ user: { id: req.user.id, username: req.user.username } });
});

export default app;
