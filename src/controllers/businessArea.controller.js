const BusinessArea = require('../schema/businessArea.schema').Model;
const chalk = require('chalk');

exports.addBusinessArea = addBusinessArea;
exports.getAllBusinessAreas = getAllBusinessAreas;
exports.getBusinessAreaByID = getBusinessAreaByID;
exports.updateBusinessAreaByID = updateBusinessAreaByID;
exports.deleteBusinessAreaByID = deleteBusinessAreaByID;

/**
 * Adds a new businessArea to the database
 * @param {object} req Request object
 * @param {object} res Response object
 * @returns {object} HTTP response
 */
function addBusinessArea(req, res) {
  console.log('POST', chalk.blue('/businessareas/'));
  console.log(chalk.black.bgBlue('Adding BusinessArea...'));

  const businessArea = new BusinessArea(req.body.businessArea);
  console.log(businessArea);

  try {
    businessArea.save();
    res.status(200).send(businessArea);
  } catch (e) {
    console.log(chalk.red(e));
    res.status(500).send({
      message: 'Failed to save businessArea'
    })
  }
}

/**
 * Gets all businessAreas from database
 * @param {object} req Request object
 * @param {object} res Response object
 * @returns {object} HTTP response
 */
function getAllBusinessAreas(req, res) {
  console.log('GET', chalk.blue('/businessareas/'));
  console.log(chalk.black.bgBlue('Getting All BusinessAreas...'));

  try {
    BusinessArea.find({ deleted: { $ne: true } }).exec((err, businessAreas) => {
      if (err) { throw(err); }
      res.status(200).send(businessAreas)
    })
  } catch (e) {
    console.log(chalk.red(e));
    res.status(500).send({
      message: 'Failed to get all businessAreas'
    })
  }
}

/**
 * Get specific businessArea in database
 * @param {object} req Request object
 * @param {object} res Response object
 * @returns {object} HTTP response
 */
function getBusinessAreaByID(req, res) {
  const businessAreaID = req.params.businessAreaID;
  console.log('GET', chalk.blue('/businessareas/'), businessAreaID);
  console.log(chalk.black.bgBlue('Getting All BusinessAreas...'));

  try {
    BusinessArea.findById(businessAreaID).exec((err, businessArea) => {
      if (err) { throw(err); }
      if (businessArea.deleted) {
        throw(true);
      }
      res.status(200).send({
        success: true,
        body: {
          businessArea: businessArea
        }
      });
    })
  } catch (e) {
    console.log(chalk.red(e));
    res.status(500).send({
      success: false,
      message: 'Failed to get businessArea'
    })
  }
}

/**
 * Update specific businessArea in database
 * @param {object} req Request object
 * @param {object} res Response object
 * @returns {object} HTTP response
 */
function updateBusinessAreaByID(req, res) {
  const businessAreaID = req.params.businessAreaID;
  const updates = req.body.businessArea;
  updates.dateEdited = new Date();
  console.log('UPDATE', chalk.blue('/businessareas/'), businessAreaID);
  console.log(chalk.black.bgBlue('Updating BusinessArea...'));

  try {
    BusinessArea.findByIdAndUpdate(businessAreaID, {
      title: updates.title,
      description: updates.description,
      businessAreaID: updates.businessAreaID,
      businessAreaName: updates.businessAreaName,
      dateEdited: updates.dateEdited,
    }, { new: true }).exec((err, newBusinessArea) => {
      if (err) { throw(err); }
      res.status(200).send({
        success: true,
        body: {
          businessArea: newBusinessArea
        }
      })
    })
  } catch (e) {
    console.log(chalk.red(e));
    res.status(500).send({
      success: false,
      message: 'Failed to update businessArea'
    })
  }
}

/**
 * Delete businessArea in database
 * @param {object} req Request object
 * @param {object} res Response object
 * @returns {object} HTTP response
 */
function deleteBusinessAreaByID(req, res) {
  const businessAreaID = req.params.businessAreaID;
  console.log('DELETE', chalk.blue('/businessareas/'), businessAreaID);
  console.log(chalk.black.bgBlue('Deleting BusinessArea...'));

  try {
    BusinessArea.findByIdAndUpdate(businessAreaID, {
      deleted: true
    }, { new: true }).exec((err, newBusinessArea) => {
      if (err) { throw(err); }
      res.status(200).send({
        success: true,
        body: {
          businessArea: newBusinessArea
        }
      })
    })
  } catch (e) {
    console.log(chalk.red(e));
    res.status(500).send({
      success: false,
      message: 'Failed to update businessArea'
    })
  }
}