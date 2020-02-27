const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const chalk = require('chalk');
const user_routes = require('./controllers/user');
const follow_routes = require('./controllers/follows');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
/*Middlewares*/
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', user_routes);
app.use('/api', follow_routes);
mongoose.connect(
  'mongodb://localhost:27017/web-app',
  { useUnifiedTopology: true, useNewUrlParser: true },
  err => {
    console.log(`${chalk.green('[MongoDB]')} connected correctly to database`);
    server.listen(PORT, () => {
      console.log(
        `${chalk.red('[Server]')} is running on port http://localhost:${PORT}`
      );
    });
  }
);
