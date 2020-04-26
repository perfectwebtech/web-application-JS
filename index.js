const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
let server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const chalk = require('chalk');
const user_routes = require('./controllers/user');
const follow_routes = require('./controllers/follows');
const publication_routes = require('./controllers/publication');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const fileUpload = require('express-fileupload');
const socketIo = require('socket.io');
const io = socketIo(server);
/*Middlewares*/
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'uploads')));
app.use(fileUpload({ useTempFiles: true }));
app.use('/api', user_routes);
app.use('/api', follow_routes);
app.use('/api', publication_routes);
module.exports.io = io;
app.use(require('./controllers/sockets/sockets'));
mongoose.connect(
  'mongodb://localhost:27017/web-app',
  { useUnifiedTopology: true, useNewUrlParser: true },
  (err) => {
    console.log(`${chalk.green('[MongoDB]')} connected correctly to database`);
    server.listen(PORT, () => {
      console.log(
        `${chalk.red('[Server]')} is running on port http://localhost:${PORT}`
      );
    });
  }
);
