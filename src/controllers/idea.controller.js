const Idea = require('../schema/idea.schema');
const filter = require('./filter.helper');
const User = require('../schema/user.schema').Model;
const auth = require('basic-auth');
const btoa = require('btoa');
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

  const creds = auth(req);
  const encodedCreds = btoa(`${creds.name}:${creds.pass}`);

  if (!req.session.user || req.session.user.authToken !== encodedCreds) {
    return res.status(401).send({
      message: 'Non-authenticated user'
    });
  }

  const idea = new Idea(req.body.idea);
  idea.dateSubmitted = new Date();
  idea.author = new User(req.session.user);

  if (!idea.title || !idea.businessAreas || !idea.description
  || !idea.icon || !idea.color || !idea.author) {
    return res.status(400).send({
      message: 'Invalid idea object'
    });
  }

  try {
    idea.save();
    console.log(idea);
    return res.status(201).send(idea);
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

  const query = filter.buildQuery(req.query);

  try {
    Idea.aggregate([
      { $match: query },
      { $sort: { dateSubmitted: -1 } }
    ]).exec((err, ideas) => {
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
async function updateIdeaByID(req, res) {
  const ideaID = req.params.ideaID;
  const updates = req.body.idea;
  const dateEdited = new Date();
  console.log('UPDATE', chalk.blue('/ideas/'), ideaID);
  console.log(chalk.black.bgBlue('Updating Idea...'));

  const creds = auth(req);
  const encodedCreds = btoa(`${creds.name}:${creds.pass}`);
  let author;

  if (!req.session.user || req.session.user.authToken !== encodedCreds) {
    return res.status(401).send({
      message: 'Non-authenticated user'
    });
  }

  // Get author
  // Validate that current user is author
  Idea.findById(ideaID).exec((err, matchedIdea) => {
    if (err) { throw(err); }

    author = matchedIdea.author;
    if (author._id.toString() !== req.session.user._id.toString()) {
      return res.status(403).send({
        message: 'User not authorized'
      });
    }

    // Perform update
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
        return res.status(200).send(newIdea)
      })
    } catch (e) {
      console.log(chalk.red(e));
      return res.status(500).send({
        message: 'Failed to update idea'
      })
    }
  });

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