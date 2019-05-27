'use strict';

const express = require('express');
const router = new express.Router();
const chalk = require('chalk');

const USER = require('../controllers/user.controller');
const IDEA = require('../controllers/idea.controller');

// NEW IDEA
router.post(
  '/',
  USER.isAuthenticated,
  IDEA.addIdea
);
// GET ALL ENTRIES
router.get(
  '/',
  IDEA.getIdeas
);
// GET IDEA BY ID
router.get(
  '/:ideaID',
  IDEA.getIdeaByID
);
// UPDATE IDEA BY ID
router.put(
  '/:ideaID',
  USER.isAuthorized,
  IDEA.updateIdeaByID
);
// DELETE IDEA BY ID
router.delete(
  '/:ideaID',
  USER.isAuthorized,
  IDEA.deleteIdeaByID
);

module.exports = router;