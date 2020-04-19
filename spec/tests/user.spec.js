const express = require('express');
const app = express();
const http = require('http');
const axios = require('axios').default;
const request = require('request');
const logger = require('morgan');
const User = require('../../models/user');
const userRouter = require('../../controllers/user');
const { alex, monica } = require('./mocks/users');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const {
  manageTestResponse,
  handleTestError,
} = require('../../Middlewares/utils');
const mongoose = require('mongoose');
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
    describe('get all users', () => {
      it('200 get all users', (done) => {
        const users = [alex, monica];
        spyOn(mongoose.Query.prototype, 'exec')
          .and.callThrough()
          .and.callFake((callback) => {
            callback(false, users);
          });
        axios.get('http://localhost:3000/api/users').then((response) => {
          expect(response.status).toBe(200);
          expect(response.data).toEqual(manageTestResponse(users));
          done();
        });
      });
      it('500 get all users', (done) => {
        spyOn(mongoose.Query.prototype, 'exec')
          .and.callThrough()
          .and.callFake((callback) => {
            callback(true, {});
          });
        axios
          .get('http://localhost:3000/api/users')
          .then((response) => {})
          .catch((err) => {
            expect(err.response.status).toBe(500);
            done();
          });
      });
    });
    describe('get one user per id', () => {
      it('200 status get one user per id', (done) => {
        const id = '5e8568b6b7c7c6623235d6c4720b';
        spyOn(User, 'findById').and.callFake((id, callback) => {
          callback(false, alex);
        });
        axios.get(`http://localhost:3000/api/user/${id}`).then((response) => {
          expect(response.status).toBe(200);
          expect(response.data).toEqual(manageTestResponse(alex));
          done();
        });
      });
      it('500 status get one user per id', (done) => {
        const id = '5e8568b6b7c7c6623235d6c4720b';
        spyOn(User, 'findById').and.callFake((id, callback) => {
          callback(true, {});
        });
        axios
          .get(`http://localhost:3000/api/user/${id}`)
          .then((response) => {})
          .catch((err) => {
            expect(err.response.status).toBe(500);
            done();
          });
      });
      it('404 status get one user per id', (done) => {
        const id = '5e8568b6b7c7c6623235d6c4720b';
        spyOn(User, 'findById').and.callFake((id, callback) => {
          callback(false, null);
        });
        axios
          .get(`http://localhost:3000/api/user/${id}`)
          .then((response) => {})
          .catch((err) => {
            expect(err.response.status).toBe(404);
            expect(err.response.data).toEqual(handleTestError(404));
            done();
          });
      });
    });
  });
  describe('POST', () => {
    //**REGISTER A USER
    it('200 register a user', (done) => {
      const userToRegister = {
        nickname: 'alexFiorenza',
        password: 'alex123',
        email: 'alexitofiorenza@gmail.com',
        name: 'Alex',
      };
      spyOn(User, 'find').and.callFake((condition, callback) => {
        callback(false, []);
      });
      spyOn(bcrypt, 'hash').and.callFake(
        (passwordUser, saltRounds, callback) => {
          callback(false, 'alex123');
        }
      );
      spyOn(User, 'create').and.callFake((data, callback) => {
        callback(false);
      });
      axios
        .post('http://localhost:3000/api/register', userToRegister)
        .then((res) => {
          expect(res.status).toBe(200);
          expect(res.data).toEqual({
            ok: true,
            message: 'User was stored',
            image: 'http://localhost:3000/users/default.png',
          });
          done();
        });
    });
    it('500 register a user', (done) => {
      const userToRegister = {
        nickname: 'alexFiorenza',
        password: 'alex123',
        email: 'alexitofiorenza@gmail.com',
        name: 'Alex',
      };
      spyOn(User, 'find').and.callFake((condition, callback) => {
        callback(false, []);
      });
      spyOn(bcrypt, 'hash').and.callFake(
        (passwordUser, saltRounds, callback) => {
          callback(false, 'alex123');
        }
      );
      spyOn(User, 'create').and.callFake((data, callback) => {
        callback(true);
      });
      axios
        .post('http://localhost:3000/api/register', userToRegister)
        .then((res) => {})
        .catch((err) => {
          expect(err.response.status).toBe(500);
          done();
        });
    });
    it('404 register a user (body invalid)', (done) => {
      const userToRegister = {
        nickname: 'alexFiorenza',
        password: 'alex123',
        email: 'alexitofiorenza@gmail.com',
        name: 'Alex',
      };
      spyOn(User, 'find').and.callFake((condition, callback) => {
        callback(false, []);
      });
      spyOn(bcrypt, 'hash').and.callFake(
        (passwordUser, saltRounds, callback) => {
          callback(false, 'alex123');
        }
      );
      spyOn(User, 'create').and.callFake((data, callback) => {
        callback(true);
      });
      axios
        .post('http://localhost:3000/api/register')
        .then((res) => {})
        .catch((err) => {
          expect(err.response.status).toBe(400);
          done();
        });
    });
    it('404 register a user (user already exists)', (done) => {
      const userToRegister = {
        nickname: 'alexFiorenza',
        password: 'alex123',
        email: 'alexitofiorenza@gmail.com',
        name: 'Alex',
      };
      spyOn(User, 'find').and.callFake((condition, callback) => {
        callback(false, [alex]);
      });
      axios
        .post('http://localhost:3000/api/register', userToRegister)
        .then((res) => {})
        .catch((err) => {
          expect(err.response.status).toBe(400);
          done();
        });
    });
  });
});
