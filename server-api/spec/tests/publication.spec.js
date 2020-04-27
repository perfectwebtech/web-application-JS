const express = require('express');
const app = express();
const http = require('http');
const axios = require('axios').default;
const logger = require('morgan');
const Publication = require('../../models/publication');
const publicationRouter = require('../../controllers/publication');
const bodyParser = require('body-parser');
const superagent = require('superagent');
const jwt = require('jsonwebtoken');
const {
  manageTestResponse,
  handleTestError,
} = require('../../Middlewares/utils');
app.use(logger('dev'));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/api', publicationRouter);
app.set('port', 3000);
function verifyTokenTests(userReturned) {
  spyOn(jwt, 'verify').and.callFake((headers, decoded, callback) => {
    callback(false, userReturned);
  });
}

describe('Initialize server', () => {
  let server;
  beforeAll(() => {
    server = http.createServer(app);
    server.listen(3000);
  });
  afterAll(() => {
    server.close();
  });
});
