const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const { Server } = require('socket.io');
const http = require('http');

const topicRoutes = require('./routes/topicRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:3002",
            "http://localhost:3003",
            "http://localhost:3004",
            "http://localhost:3005",
            "http://localhost:3006",
            "http://localhost:3007",
            "http://localhost:3008",
            "http://localhost:3009",
            "http://localhost:3010",
            "https://anandsharma2002.github.io"
        ],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    }
});

// CORS Configuration
app.use(cors({
    origin: [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:3003",
        "http://localhost:3004",
        "http://localhost:3005",
        "http://localhost:3006",
        "http://localhost:3007",
        "http://localhost:3008",
        "http://localhost:3009",
        "http://localhost:3010",
        "https://anandsharma2002.github.io"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use(cookieParser());

// Pass io to routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/webhook', require('./routes/webhookRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));

// Serve Uploads Static Folder
app.use('/uploads', express.static('uploads'));

// Database
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log('MongoDB Connection Error:', err));

app.get('/', (req, res) => {
    res.send('BrainDocs API Running');
});

// Socket
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
