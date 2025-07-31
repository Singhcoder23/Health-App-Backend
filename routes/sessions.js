const express = require('express');
const Session = require('../models/Session');
const auth = require('../middleware/auth');
const { validationResult } = require('express-validator');
const { saveDraftValidation, publishValidation } = require('../validations/sessionValidation');

const router = express.Router();

router.get('/sessions', async (req, res, next) => {
  try {
    const sessions = await Session.find({ status: 'published' }).sort({ created_at: -1 });
    res.json(sessions);
  } catch (err) {
    next(err);
  }
});

router.get('/my-sessions', auth, async (req, res, next) => {
  try {
    const sessions = await Session.find({ user_id: req.user.id }).sort({ updated_at: -1 });
    res.json(sessions);
  } catch (err) {
    next(err);
  }
});

router.get('/my-sessions/:id', auth, async (req, res, next) => {
  try {
    const session = await Session.findOne({ user_id: req.user.id, _id: req.params.id });
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json(session);
  } catch (err) {
    next(err);
  }
});


router.post('/my-sessions/save-draft', auth, saveDraftValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { _id, title, tags, json_file_url } = req.body;
    let session;
    if (_id) {
      session = await Session.findOneAndUpdate(
        { user_id: req.user.id, _id },
        { title, tags: tags || [], json_file_url, status: 'draft', updated_at: Date.now() },
        { new: true }
      );
      if (!session) return res.status(404).json({ message: 'Draft session not found' });
    } else {
      session = new Session({ user_id: req.user.id, title, tags: tags || [], json_file_url, status: 'draft' });
      await session.save();
    }
    res.json(session);
  } catch (err) {
    next(err);
  }
});

router.post('/my-sessions/publish', auth, publishValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { _id, title, tags, json_file_url } = req.body;
    let session;
    if (_id) {
      session = await Session.findOneAndUpdate(
        { user_id: req.user.id, _id },
        { title, tags: tags || [], json_file_url, status: 'published', updated_at: Date.now() },
        { new: true }
      );
      if (!session) return res.status(404).json({ message: 'Session not found' });
    } else {
      session = new Session({ user_id: req.user.id, title, tags: tags || [], json_file_url, status: 'published' });
      await session.save();
    }
    res.json(session);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
