const Idea = require('../schema/idea.schema');
const chalk = require('chalk');

exports.addIdea = addIdea;
exports.getAllIdeas = getAllIdeas;
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
    res.status(200).send({
      success: true,
      body: idea
    });
  } catch (e) {
    console.log(chalk.red(e));
    res.status(500).send({
      success: false,
      message: 'Failed to save idea'
    })
  }
}

/**
 * Gets all ideas from database
 * @param {object} req Request object
 * @param {object} res Response object
 * @returns {object} HTTP response
 */
function getAllIdeas(req, res) {
  console.log('GET', chalk.blue('/ideas/'));
  console.log(chalk.black.bgBlue('Getting All Ideas...'));

  try {
    Idea.find({ Deleted: { $ne: true } }).exec((err, ideas) => {
      if (err) { throw(err); }
      res.status(200).send({
        success: true,
        body: {
          totalAmount: ideas.reduce((acc, curr) => {
            return acc + curr.AmountPaid;
          }, 0),
          ideas: ideas.sort((a, b) => {
            return new Date(b.DateAdded) - new Date(a.DateAdded);
          })
        }
      })
    })
  } catch (e) {
    console.log(chalk.red(e));
    res.status(500).send({
      success: false,
      message: 'Failed to get all ideas'
    })
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
  console.log(chalk.black.bgBlue('Getting All Ideas...'));

  try {
    Idea.findById(ideaID).exec((err, idea) => {
      if (err) { throw(err); }
      if (idea.deleted) {
        throw(true);
      }
      res.status(200).send({
        success: true,
        body: {
          idea: idea
        }
      });
    })
  } catch (e) {
    console.log(chalk.red(e));
    res.status(500).send({
      success: false,
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
  updates.dateEdited = new Date();
  console.log('UPDATE', chalk.blue('/ideas/'), ideaID);
  console.log(chalk.black.bgBlue('Updating Idea...'));

  try {
    Idea.findByIdAndUpdate(ideaID, {
      title: updates.title,
      description: updates.description,
      businessAreaID: updates.businessAreaID,
      businessAreaName: updates.businessAreaName,
      dateEdited: updates.dateEdited,
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