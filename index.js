const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Initialize Supabase Storage
const { initializeStorage } = require('./config/initStorage');
initializeStorage();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Route files
const auth = require('./routes/authRoutes');
const topics = require('./routes/topicRoutes');
const content = require('./routes/contentRoutes');
const search = require('./routes/searchRoutes');
const upload = require('./routes/upload');
const users = require('./routes/userRoutes');

// Mount routers
app.use('/api/v1/auth', auth);
app.use('/api/v1/topics', topics);
app.use('/api/v1/content', content);
app.use('/api/v1/search', search);
app.use('/api/v1/upload', upload);
app.use('/api/v1/users', users);

// Basic Route
app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
