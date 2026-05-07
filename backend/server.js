const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();

// Create uploads directory if it doesn't exist
const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`Created uploads directory at: ${uploadDir}`);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fondorax', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected');
  console.log('Connected to DB:', mongoose.connection.name);
})
.catch(err => console.log('MongoDB connection error:', err));

// Import models to register them with mongoose
require('./models/User');
require('./models/Admin');
require('./models/AdminLog');
require('./models/Startup');
require('./models/PitchDeck');
require('./models/Analysis');
require('./models/Portfolio');
require('./models/Document');
require('./models/Deal');
require('./models/Marketplace');
require('./models/ProofOfWork');
require('./models/Resource');
require('./models/EligibilityProfile');
require('./models/Watchlist');
require('./models/TrustScore');
require('./models/DueDiligence');

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/founder', require('./routes/founder'));
app.use('/api/investor', require('./routes/investor'));
app.use('/api/investor-v2', require('./routes/investorEnhanced'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/admin-v2', require('./routes/adminNew'));
app.use('/api/pitch', require('./routes/pitch'));
app.use('/api/pitch-analysis', require('./routes/pitchAnalysis'));
app.use('/api/marketplace', require('./routes/marketplace'));
app.use('/api/resources', require('./routes/resources'));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : {} 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
