const { body } = require('express-validator');

exports.saveDraftValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('json_file_url').optional().isURL().withMessage('JSON URL must be valid'),
];

exports.publishValidation = [
  ...exports.saveDraftValidation,
  body('status').optional().isIn(['draft', 'published']).withMessage('Invalid status'),
];
