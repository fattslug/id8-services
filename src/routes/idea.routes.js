'use strict';

const express = require('express');
const router = new express.Router();
const chalk = require('chalk');

const IDEA = require('../controllers/idea.controller');

// NEW IDEA
router.post(
  '/',
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
  IDEA.updateIdeaByID
);
// DELETE IDEA BY ID
router.delete(
  '/:ideaID',
  IDEA.deleteIdeaByID
);

module.exports = router;