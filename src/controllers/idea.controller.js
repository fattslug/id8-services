const Idea = require('../schema/idea.schema');
const chalk = require('chalk');

exports.addIdea = addIdea;
exports.getIdeas = getIdeas;
exports.getIdeaByID = getIdeaByID;
exports.updateIdeaByID = updateIdeaByID;
exports.deleteIdeaByID = deleteIdeaByID;

/**
 * Adds a new idea to the database
 * @param {object} req Request object
 * @param {object} res Response object
 * @returns {object} HTTP response
 */
function addIdea(req, res) {
  console.log(chalk.blue('/ideas/'));
  console.log(chalk.black.bgBlue('Adding Idea...'));

  const idea = new Idea(req.body.idea);
  console.log(idea);

  try {
    idea.save();
    return res.status(200).send(idea);
  } catch (e) {
    console.log(chalk.red(e));
    return res.status(500).send({
      message: 'Failed to save idea'
    });
  }
}

/**
 * Gets all ideas from database
 * @param {object} req Request object
 * @param {object} res Response object
 * @returns {object} HTTP response
 */
function getIdeas(req, res) {
  console.log('GET', chalk.blue('/ideas/'));
  console.log(chalk.black.bgBlue('Getting Ideas...'));
  console.log('Query:', req.query);

  try {
    Idea.find({ deleted: { $ne: true } }).exec((err, ideas) => {
      if (err) { throw(err); }
      return res.status(200).send(ideas);
    })
  } catch (e) {
    console.log(chalk.red(e));
    return res.status(500).send({
      message: 'Failed to get all ideas'
    });
  }
}

/**
 * Get specific idea in database
 * @param {object} req Request object
 * @param {object} res Response object
 * @returns {object} HTTP response
 */
function getIdeaByID(req, res) {
  const ideaID = req.params.ideaID;
  console.log('GET', chalk.blue('/ideas/'), ideaID);
  console.log(chalk.black.bgBlue('Getting Idea...'));

  try {
    Idea.findById(ideaID).exec((err, idea) => {
      if (err) { throw(err); }
      if (idea.deleted) {
        throw(true);
      }
      res.status(200).send(idea);
    })
  } catch (e) {
    console.log(chalk.red(e));
    res.status(500).send({
      message: 'Failed to get idea'
    })
  }
}

/**
 * Update specific idea in database
 * @param {object} req Request object
 * @param {object} res Response object
 * @returns {object} HTTP response
 */
function updateIdeaByID(req, res) {
  const ideaID = req.params.ideaID;
  const updates = req.body.idea;
  const dateEdited = new Date();
  console.log('UPDATE', chalk.blue('/ideas/'), ideaID);
  console.log(chalk.black.bgBlue('Updating Idea...'));

  try {
    Idea.findByIdAndUpdate(ideaID, {
      title: updates.title,
      description: updates.description,
      businessAreas: updates.businessAreas,
      icon: updates.icon,
      color: updates.color,
      dateEdited: dateEdited
    }, { new: true }).exec((err, newIdea) => {
      if (err) { throw(err); }
      res.status(200).send(newIdea)
    })
  } catch (e) {
    console.log(chalk.red(e));
    res.status(500).send({
      message: 'Failed to update idea'
    })
  }
}

/**
 * Delete idea in database
 * @param {object} req Request object
 * @param {object} res Response object
 * @returns {object} HTTP response
 */
function deleteIdeaByID(req, res) {
  const ideaID = req.params.ideaID;
  console.log('DELETE', chalk.blue('/ideas/'), ideaID);
  console.log(chalk.black.bgBlue('Deleting Idea...'));

  try {
    Idea.findByIdAndUpdate(ideaID, {
      deleted: true
    }, { new: true }).exec((err, newIdea) => {
      if (err) { throw(err); }
      res.status(200).send({
        success: true,
        body: {
          idea: newIdea
        }
      })
    })
  } catch (e) {
    console.log(chalk.red(e));
    res.status(500).send({
      success: false,
      message: 'Failed to update idea'
    })
  }
}