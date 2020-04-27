const express = require('express');
const app = express();
const http = require('http');
const axios = require('axios').default;
const logger = require('morgan');
const Follow = require('../../models/follows');
const followsRouter = require('../../controllers/follows');
const bodyParser = require('body-parser');
const superagent = require('superagent');
const jwt = require('jsonwebtoken');
const { alex, monica, alexGoogle, userGoogle } = require('./mocks/users');
const {
  manageTestResponse,
  handleTestError,
} = require('../../Middlewares/utils');

app.use(logger('dev'));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/api', followsRouter);
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
  describe('follows get', () => {
    it('200 count follows', (done) => {
      const countFollowers = 10;
      verifyTokenTests(alex);
      spyOn(Follow, 'count').and.callFake((logic, callback) => {
        callback(false, countFollowers);
      });
      axios.get('http://localhost:3000/api/follow?count=true').then((res) => {
        expect(res.status).toBe(200);
        done();
      });
    });
    it('200 find follow', (done) => {
      const countFollowers = 10;
      verifyTokenTests(alex);
      spyOn(Follow, 'find').and.callFake((logic, callback) => {
        callback(false, countFollowers);
      });
      axios.get('http://localhost:3000/api/follow').then((res) => {
        expect(res.status).toBe(200);
        expect(res.data).toEqual({
          ok: true,
          followers: countFollowers,
          following: countFollowers,
        });
        done();
      });
    });
    it('500 find follow', (done) => {
      const countFollowers = 10;
      verifyTokenTests(alex);
      spyOn(Follow, 'find').and.callFake((logic, callback) => {
        callback(true);
      });
      axios
        .get('http://localhost:3000/api/follow')
        .then((res) => {})
        .catch((err) => {
          expect(err.response.status).toBe(500);
          done();
        });
    });
    it('400 find follow', (done) => {
      const countFollowers = 10;
      verifyTokenTests(alex);
      spyOn(Follow, 'find').and.callFake((logic, callback) => {
        callback(false, null);
      });
      axios
        .get('http://localhost:3000/api/follow')
        .then((res) => {})
        .catch((err) => {
          expect(err.response.status).toBe(400);
          done();
        });
    });
  });
  //TODO test follow someone per id
  describe('post follow someone per id', () => {});
});
