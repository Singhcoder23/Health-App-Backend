const express = require('express');
const auth = require('../middleware/auth'); // Middleware to authenticate user (JWT verification)
const Session = require('../models/Session'); // Mongoose model for sessions
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Validation chains
const saveDraftValidation = [
  body('title').optional().isString().trim(),
  body('tags').optional().isArray(),
  body('json_file_url').optional().isString().trim(),
];

const publishValidation = [
  body('title').notEmpty().isString(),
  body('tags').optional().isArray(),
  body('json_file_url').notEmpty().isString(),
];

/**
 * GET /sessions
 * Public wellness sessions (published only)
 */
router.get('/sessions', async (req, res, next) => {
  try {
    const sessions = await Session.find({ status: 'published' }).sort({ updated_at: -1 });
    res.json(sessions);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /my-sessions
 * Get current user's sessions (draft + published)
 */
router.get('/my-sessions', auth, async (req, res, next) => {
  try {
    const sessions = await Session.find({ user_id: req.user.id }).sort({ updated_at: -1 });
    res.json(sessions);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /my-sessions/:id
 * Get a single session by ID belonging to current user
 */
router.get('/my-sessions/:id', auth, async (req, res, next) => {
  try {
    const session = await Session.findOne({ user_id: req.user.id, _id: req.params.id });
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    res.json(session);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /my-sessions/save-draft
 * Save or update a draft session
 */
router.post('/my-sessions/save-draft', auth, saveDraftValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { _id, title, tags = [], json_file_url, content } = req.body;
    let session;

    const sessionData = {
      user_id: req.user.id,
      title,
      tags,
      json_file_url,
      content,
      status: 'draft',
      updated_at: Date.now(),
    };

    if (_id) {
      // Update existing draft
      session = await Session.findOneAndUpdate(
        { user_id: req.user.id, _id },
        sessionData,
        { new: true }
      );
      if (!session) return res.status(404).json({ message: 'Draft session not found' });
    } else {
      // Create new draft
      session = new Session({
        ...sessionData,
        created_at: Date.now(),
      });
      await session.save();
    }

    res.json(session);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /my-sessions/publish
 * Publish a session (create new or update existing)
 */
router.post('/my-sessions/publish', auth, publishValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { _id, title, tags = [], json_file_url, content } = req.body;
    let session;

    const sessionData = {
      user_id: req.user.id,
      title,
      tags,
      json_file_url,
      content,
      status: 'published',
      updated_at: Date.now(),
    };

    if (_id) {
      // Update existing session to published
      session = await Session.findOneAndUpdate(
        { user_id: req.user.id, _id },
        sessionData,
        { new: true }
      );
      if (!session) return res.status(404).json({ message: 'Session not found' });
    } else {
      // Create new published session
      session = new Session({
        ...sessionData,
        created_at: Date.now(),
      });
      await session.save();
    }

    res.json(session);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
