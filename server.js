require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const sessionRoutes = require('./routes/session');
const errorHandler = require('./middleware/errorHandler');

const app = express();

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', // allow frontend URL in env
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api', authRoutes);
app.use('/api', sessionRoutes);

// Error handler (must be after routes)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
