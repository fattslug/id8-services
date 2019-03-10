const ActiveDirectory = require('activedirectory');
const chalk = require('chalk');
const auth = require('basic-auth');

const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

// var privateKey = fs.readFileSync('C:\\Users\\e42229\\Development\\id8\\id8-services\\src\\private.key', 'utf8');
var privateKey = fs.readFileSync(path.join(__dirname, '..', 'authentication', 'private.key'), 'utf8');
var publicKey = fs.readFileSync(path.join(__dirname, '..', 'authentication', 'public.key'), 'utf8');

const User = require('../schema/user.schema').Model;
const Idea = require('../schema/idea.schema');
const ObjectID = require('mongodb').ObjectID;

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
      _id: new ObjectID('5c84a8f313bdba182448c0ab'),
      username: 'testuser',
      displayName: 'John Doe',
      authToken: generateJWT('testuser', new ObjectID('5c84a8f313bdba182448c0ab'))
    };
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
                displayName: userProfile.displayName
              });
            }
            
            user.authToken = generateJWT(username, user._id);
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

function generateJWT(username, id) {
  const today = new Date();
  const expirationDate = new Date(today);
  expirationDate.setDate(today.getDate() + 60);

  var signOptions = {
    issuer: process.env.AUTH_TOKEN_ISSUER,
    subject: username,
    audience: process.env.AUTH_TOKEN_AUDIENCE,
    algorithm: 'RS256'
  };

  return jwt.sign({
    username: username,
    id: id,
    exp: parseInt(expirationDate.getTime() / 1000, 10),
  }, privateKey, signOptions);
}

/**
 * * verify(req, res)
 * * Validates the user's session is valid and
 * * that the user exists in the user database
 * @param {object} req Middleware request object
 * @param {object} res Middleware response object
 * @return {void} responds with success boolean
 */
exports.verify = function (req, res) {
  const authToken = req.body.token;
  if (req.session.user.authToken === authToken) {
    User.findById(req.session.user._id).exec((err, result) => {
      if (err) { res.status(401).send(err) }
      return res.status(200).send(!!result);
    });
  } else {
    console.log(chalk.red('Auth token invalid!'));
    return res.status(401).send({
      message: 'Auth token invalid'
    });
  }
}

/**
 * * isAuthor(req, res)
 * * Checks whether user is authorized to edit a specific idea
 * @param {object} req Middleware request object
 * @param {object} res Middleware response object
 * @return {void} responds with success boolean
 */
exports.isAuthor = function (req, res) {
  const idea = req.body.idea;
  const userSession = req.session.user;
  const requestToken = req.headers.authorization.split(' ')[1];

  if (!userSession || userSession.authToken !== requestToken) {
    return res.status(401).send({
      message: 'Non-authenticated user'
    });
  }

  if (userSession._id.toString() === idea.author._id.toString()) {
    return res.status(200).send(true);
  } else {
    return res.status(200).send(false);
  }
}

/**
 * * verify(req, res)
 * * Validates the user's session is valid and
 * * that the user exists in the user database
 * @param {object} req Middleware request object
 * @param {object} res Middleware response object
 * @return {void} responds with success boolean
 */
exports.verify = function(req, res) {
  const authToken = req.body.token;
  if (req.session.user.authToken === authToken) {
    console.log('Auth token valid!')
    User.findById(req.session.user._id).exec((err, result) => {
      if (err) { res.status(401).send(err) }
      return res.status(200).send(!!result);
    });
  } else {
    console.log(chalk.red('Auth token invalid!'));
    return res.status(401).send({
      message: 'Auth token invalid'
    });
  }
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
  const encodedCreds = process.env.USE_AUTHENTICATION === 'true' ? btoa(`${creds.name}:${creds.pass}`) : 'test';

  if (!req.session.user || req.session.user.authToken !== encodedCreds) {
    return res.status(401).send({
      message: 'Non-authenticated user'
    });
  }

  console.log(req.session.user._id);
  console.log(idea.author._id);

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
 * * isAuthenticated(req, res)
 * * Validates that server session exists for the requesting client
 * @param {object} req Middleware request object
 * @param {object} res Middleware response object
 * @return {void} responds with true if session exists
 */
exports.isAuthenticated = function (req, res, next) {
  const token = req.headers.authorization.split(' ')[1];
  const userSession = req.session.user;

  if (!userSession) {
    return res.status(401).send({
      message: 'No logged in user'
    });
  }

  var verifyOptions = {
    issuer: process.env.AUTH_TOKEN_ISSUER,
    subject: userSession.username,
    audience: process.env.AUTH_TOKEN_AUDIENCE,
    algorithm: 'RS256'
  };

  const tokenData = jwt.verify(token, publicKey, verifyOptions);
  if (userSession._id === tokenData.id) {
    next();
  } else {
    res.status(401).send({
      message: 'Invalid token'
    })
  }
};
