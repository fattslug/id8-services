require('dotenv').config();

const express = require('express');
const port = process.env.PORT || 3001;
const bodyParser = require('body-parser');
const http = require('http');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const chalk = require('chalk');

const db = require('./src/db');
const app = express();

// CORS Setup
if (process.env.USE_CORS === 'true') {
  const allowedOrigins = process.env.ALLOWED_ORIGINS;
  const corsOptions = {
    origin: '',
    credentials: true,
    optionsSuccessStatus: 200
  }

  app.use((req, res, next) => {
    if (allowedOrigins.indexOf(req.headers.origin) > -1) {
      corsOptions.origin = req.headers.origin;
      next();
    } else {
      console.log(chalk.red('Access from invalid origin: '), req.headers.origin);
      res.sendStatus(403);
    }
  });
  app.use(cors(corsOptions));
}

// Body Parser
app.use(bodyParser.json({
  limit: process.env.JSON_SIZE_LIMIT
}));
app.use(bodyParser.urlencoded({
  limit: process.env.JSON_SIZE_LIMIT,
  extended: true
}));

// Sessions
app.use(session({
  secret: process.env.SESSION_SECRET,
  name: process.env.SESSION_NAME,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: false
  },
  resave: false,
  store: new MongoStore({
    mongooseConnection: db.connection,
    ttl: ((60 * 60) * 12) // 12 hours
  })
}))

// Routes
const ideaRoutes = require('./src/routes/idea.routes');
app.use('/ideas', ideaRoutes);
const businessAreaRoutes = require('./src/routes/businessArea.routes');
app.use('/businessareas', businessAreaRoutes);
const userRoutes = require('./src/routes/user.routes');
app.use('/user', userRoutes);

// Listen
let server = http.createServer(app);
server.listen(port);
server.on('listening', () => {
  console.log(chalk.black.bgGreen(`==> Listening on port ${port}...`))
})