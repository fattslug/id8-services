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
// LOG USER OUT
router.get(
  '/logout',
  USER.logout
);

module.exports = router;