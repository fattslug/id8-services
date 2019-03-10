const ActiveDirectory = require('activedirectory');
const chalk = require('chalk');
const auth = require('basic-auth');
const btoa = require('btoa');
const User = require('../schema/user.schema').Model;

/**
 * * login(req, res)
 * * Uses Aviva LDAP server to authenticate user
 * @param {object} req Middleware request object
 * @param {object} res Middleware response object
 * @return {void} responds with user object
 */
exports.login = async function (req, res) {
  console.log(chalk.blue('/user/login'));
  console.log(chalk.black.bgBlue('Logging user in...'));

  if (process.env.USE_AUTHENTICATION === 'false') {
    req.session.user = {
      _id: 1,
      username: 'testuser',
      displayName: 'John Doe'
    }
    return res.send(req.session.user);
  }

  const config = {
    host: process.env.LDAP_HOST,
    port: process.env.LDAP_POST,
    url: process.env.LDAP_URL,
    baseDN: process.env.LDAP_BASEDN,
    username: process.env.LDAP_USERNAME,
    password: process.env.LDAP_PASSWORD,
  };
  const creds = auth(req);
  let username, password;
  if (creds) {
    username = creds.name + '@ana.corp.aviva.com';
    password = creds.pass;
  }

  const activeDirectory = new ActiveDirectory(config);
  activeDirectory.authenticate(username, password, async (err, result) => {
    if (err) {
      console.log(chalk.black.bgRed('Error in authentication.'));
      return res.sendStatus(401);
    } else {
      if (result) {
        activeDirectory.findUser(username, async (err, userProfile) => {
          try {
            console.log('Authentication successful!');

            let user = await checkForUser(username);
            if (!user) {
              user = await addUser({
                username: username,
                displayName: userProfile.displayName,
                authToken: btoa(`${creds.name}:${creds.pass}`)
              });
            }
            req.session.user = user;
            return res.send(user);

          } catch (e) {
            console.log('Error checking for user:', e);
            res.status(500).send({
              message: 'Error checking for user.'
            })
          }
        });
      }
    }
  });
};

async function checkForUser(username, userID = null) {
  return new Promise((resolve, reject) => {
    const query = {};
    query.username = username;
    if (userID) {
      query._id = userID;
    }
    User.findOne(query).exec((err, result) => {
      if (err) { reject(err) }
      return resolve(result);
    });
  });
}

async function addUser(user) {
  const newUser = new User(user);
  try {
    newUser.save();
    return newUser;
  } catch (e) {
    console.log('Error adding user:', e);
    return false;
  }
}

/**
 * * verify(req, res)
 * * Validates the user's authToken exists in the user database
 * @param {object} req Middleware request object
 * @param {object} res Middleware response object
 * @return {void} responds with success boolean
 */
exports.verify = function(req, res) {
  const authToken = req.body.token;
  User.findOne({authToken: authToken}).exec((err, result) => {
    if (err) { res.status(401).send(err) }
    return res.status(200).send(!!result);
  });
}

/**
 * * authorized(req, res)
 * * Checks whether user is authorized to edit a specific idea
 * @param {object} req Middleware request object
 * @param {object} res Middleware response object
 * @return {void} responds with success boolean
 */
exports.authorized = function(req, res) {
  const idea = req.body.idea;

  const creds = auth(req);
  const encodedCreds = btoa(`${creds.name}:${creds.pass}`);

  if (!req.session.user || req.session.user.authToken !== encodedCreds) {
    return res.status(401).send({
      message: 'Non-authenticated user'
    });
  }

  if (req.session.user._id.toString() !== idea.author._id.toString()) {
    return res.status(200).send(false);
  } else {
    return res.status(200).send(true);
  }
}

/**
 * * logout(req, res)
 * * Nullifies user object on server
 * @param {object} req Middleware request object
 * @param {object} res Middleware response object
 * @return {void} responds with success boolean
 */
exports.logout = function (req, res) {
  req.session.user = null;
  res.status(200).send(true);
};

/**
 * * checkLogin(req, res)
 * * Validates that server session exists for the requesting client
 * @param {object} req Middleware request object
 * @param {object} res Middleware response object
 * @return {void} responds with true if session exists
 */
exports.checkLogin = function (req, res) {
  console.log('Checking User Session...');
  console.log(req.session.user);
  res.send(req.session.user ? req.session.user : false);
};
