'use strict';

const express = require('express');
const router = new express.Router();
const chalk = require('chalk');

const BUSINESS = require('../controllers/businessArea.controller');

// NEW IDEA
router.post(
  '/',
  BUSINESS.addBusinessArea
);
// GET ALL ENTRIES
router.get(
  '/',
  BUSINESS.getAllBusinessAreas
);
// GET IDEA BY ID
router.get(
  '/:businessAreaID',
  BUSINESS.getBusinessAreaByID
);
// UPDATE IDEA BY ID
router.put(
  '/:businessAreaID',
  BUSINESS.updateBusinessAreaByID
);
// DELETE IDEA BY ID
router.delete(
  '/:businessAreaID',
  BUSINESS.deleteBusinessAreaByID
);

module.exports = router;