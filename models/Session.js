const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  tags: { type: [String], default: [] },
  json_file_url: { type: String, default: '' },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Session', sessionSchema);
