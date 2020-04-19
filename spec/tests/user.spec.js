const express = require('express');
const app = express();
const http = require('http');
const axios = require('axios');
const request = require('request');
const logger = require('morgan');
const User = require('../../models/user');
const userRouter = require('../../controllers/user');
const { alex } = require('./mocks/users');
const bodyParser = require('body-parser');
const {
  manageTestResponse,
  handleTestError,
} = require('../../Middlewares/utils');
app.use(logger('dev'));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/api', userRouter);
app.set('port', 3000);

describe('Initialize server', () => {
  let server;
  beforeAll(() => {
    server = http.createServer(app);
    server.listen(3000);
  });
  afterAll(() => {
    server.close();
  });
  describe('GET', () => {
    //TODO Test get all users
    it('200 status get one user per id', (done) => {
      const id = '5e8568b6b7c7c6623235d6c4720b';
      spyOn(User, 'findById').and.callFake((id, callback) => {
        callback(false, alex);
      });
      request.get(
        `http://localhost:3000/api/user/${id}`,
        (err, response, body) => {
          expect(response.statusCode).toBe(200);
          expect(JSON.parse(body)).toEqual(manageTestResponse(alex));
          done();
        }
      );
    });
    it('500 status get one user per id', (done) => {
      const id = '5e8568b6b7c7c6623235d6c4720b';
      spyOn(User, 'findById').and.callFake((id, callback) => {
        callback(true, {});
      });
      request.get(
        `http://localhost:3000/api/user/${id}`,
        (err, response, body) => {
          expect(response.statusCode).toBe(500);
          done();
        }
      );
    });
    it('404 status get one user per id', (done) => {
      const id = '5e8568b6b7c7c6623235d6c4720b';
      spyOn(User, 'findById').and.callFake((id, callback) => {
        callback(false, null);
      });
      request.get(
        `http://localhost:3000/api/user/${id}`,
        (err, response, body) => {
          expect(response.statusCode).toBe(404);
          expect(JSON.parse(response.body)).toEqual(handleTestError(404));
          done();
        }
      );
    });
  });
});
