const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const auth = require('../middleware/auth');

router.get('/sessions', async (req, res) => {
  try {
    const sessions = await Session.find({ status: 'published' });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch public sessions.' });
  }
});

router.get('/my-sessions', auth, async (req, res) => {
  try {
    const sessions = await Session.find({ user_id: req.user.userId });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch your sessions.' });
  }
});

router.get('/my-sessions/:id', auth, async (req, res) => {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      user_id: req.user.userId,
    });
    if (!session) return res.status(404).json({ error: 'Session not found.' });
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch session.' });
  }
});

router.post('/my-sessions/save-draft', auth, async (req, res) => {
  try {
    const { _id, title, tags, json_file_url } = req.body;
    let session;
    if (_id) {
      
      session = await Session.findOneAndUpdate(
        { _id, user_id: req.user.userId },
        {
          title,
          tags,
          json_file_url,
          status: 'draft',
          updated_at: new Date(),
        },
        { new: true }
      );
    } else {
    
      session = await Session.create({
        user_id: req.user.userId,
        title,
        tags,
        json_file_url,
        status: 'draft',
      });
    }
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save draft.' });
  }
});

router.post('/my-sessions/publish', auth, async (req, res) => {
  try {
    const { _id } = req.body;
    const session = await Session.findOneAndUpdate(
      { _id, user_id: req.user.userId },
      { status: 'published', updated_at: new Date() },
      { new: true }
    );
    if (!session) return res.status(404).json({ error: 'Session not found.' });
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: 'Failed to publish session.' });
  }
});

module.exports = router;
