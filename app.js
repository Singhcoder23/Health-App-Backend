const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); 


const authRoutes = require('./routes/auth');
const sessionRoutes = require('./routes/sessions');

const app = express();


app.use(cors());           
app.use(express.json());   


mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

app.use('/auth', authRoutes);     
app.use('/', sessionRoutes);     


app.get('/', (req, res) => {
  res.send('Wellness Sessions API is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});
