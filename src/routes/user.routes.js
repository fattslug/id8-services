'use strict';

const express = require('express');
const router = new express.Router();
const chalk = require('chalk');

const USER = require('../controllers/user.controller');

// LOG USER IN
router.post(
  '/login',
  USER.login
);
// VERIFY USER
router.post(
  '/verify',
  USER.verify
);
// IS USER AUTHORIZED
router.post(
  '/authorized',
  USER.isAuthor
);
// LOG USER OUT
router.get(
  '/logout',
  USER.logout
);

module.exports = router;