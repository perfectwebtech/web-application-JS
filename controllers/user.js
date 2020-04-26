const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const { verifyToken, roleAuth, verify } = require('../Middlewares/auth');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const _ = require('underscore');
const { OAuth2Client } = require('google-auth-library');
const generate = require('generate-password');
const hat = require('hat');
const io = require('../index');
const {
  manageImg,
  handleError,
  manageResponse,
} = require('../Middlewares/utils');
const mongoose = require('mongoose');
/* Get all users and paginate from query params*/
router.get('/users', (req, res) => {
  const { query } = req;
  const limit = parseInt(query.limit);
  User.find({ state: 'ACTIVE' })
    .limit(limit)
    .exec((err, usersFound) => {
      if (err) {
        return handleError(500, req, res, err);
      }
      return manageResponse(200, usersFound, req, res);
    });
});
/*Found one user per id*/
router.get('/user/:id', (req, res) => {
  let { id } = req.params;
  User.findById(id, (err, userFound) => {
    if (err) {
      return handleError(500, req, res, err);
    }
    if (!userFound) {
      return handleError(404, req, res);
    }
    return manageResponse(200, userFound, req, res);
  });
});
/*Register a user*/
router.post('/register', (req, res) => {
  const saltRounds = 10;
  const { body } = req;
  User.find(
    { email: body.email, nickname: body.nickname },
    (err, userFound) => {
      if (userFound.length == 0) {
        if (body.password && body.email && body.nickname && body.name) {
          bcrypt.hash(body.password, saltRounds, (err, encrypted) => {
            User.create(
              {
                password: encrypted,
                email: body.email,
                image: 'default.png',
                nickname: body.nickname,
                name: body.name,
                role: 'USER',
                google: false,
                state: 'ACTIVE',
              },
              (err) => {
                if (err) {
                  return handleError(500, req, res, err);
                }
                return res.status(200).json({
                  ok: true,
                  message: 'User was stored',
                  image: `http://localhost:3000/users/default.png`,
                });
              }
            );
          });
        } else {
          return handleError(400, req, res);
        }
      } else {
        return handleError(400, req, res);
      }
    }
  );
});
/*LogIn users*/
router.post('/login', (req, res) => {
  const { body } = req;
  User.findOne({ email: body.email, google: false }, (err, userFound) => {
    if (err) {
      return handleError(500, req, res, err);
    }
    if (!userFound) {
      return handleError(404, req, res);
    }
    const user = {
      name: userFound.name,
      nickname: userFound.nickname,
      email: userFound.email,
      _id: userFound._id,
      image: userFound.image,
      role: userFound.role,
      state: userFound.state,
      google: userFound.google,
    };
    bcrypt.compare(body.password, userFound.password, (err, matched) => {
      if (matched) {
        const privateKey = fs.readFileSync('Middlewares/private.key', 'utf8');
        const token = jwt.sign(user, privateKey, { expiresIn: '48h' });
        return manageResponse(200, token, req, res);
      }
      if (err) {
        return handleError(500, req, res, err);
      }
      return handleError(404, req, res);
    });
  });
});

/*Update user data*/
router.put('/useData/:nick/:id', verifyToken, (req, res) => {
  const {
    params: { nick },
  } = req;
  const {
    params: { id },
  } = req;
  const actualUser = req.user;
  const { body: data } = req;
  if (actualUser.nickname === nick) {
    if (actualUser.google) {
      const googleUser = _.pick(data, ['nickname']);
      User.findByIdAndUpdate(
        id,
        googleUser,
        { new: true },
        (err, userUpdated) => {
          if (err) {
            return handleError(500, req, res, err);
          }
          return manageResponse(200, userUpdated, req, res);
        }
      );
    } else {
      const userToUpdate = _.pick(data, ['name', 'nickname', 'email', 'image']);
      User.findByIdAndUpdate(
        id,
        userToUpdate,
        { new: true },
        (err, userUpdated) => {
          if (err) {
            return handleError(500, req, res, err);
          }
          return manageResponse(200, userUpdated, req, res);
        }
      );
    }
  } else {
    return handleError(400, req, res);
  }
});
/*Delete User data*/
router.delete('/:id', verifyToken, (req, res) => {
  const dataToUpdate = _.pick(req.body, ['state', 'delete']);
  const {
    params: { id },
  } = req;
  if (id != undefined) {
    if (dataToUpdate.state === 'SUSPENDED') {
      User.findByIdAndUpdate(
        id,
        dataToUpdate,
        { new: true },
        (err, userSuspended) => {
          if (err) {
            return handleError(500, req, res, err);
          }
          return manageResponse(200, userSuspended, req, res);
        }
      );
    }
    if (dataToUpdate.delete === 'true') {
      User.findByIdAndDelete(id, (err) => {
        if (err) {
          return handleError(500, req, res, err);
        }
        return handleError(404, req, res);
      });
    }
    return handleError(404, req, res);
  } else {
    return handleError(404, req, res);
  }
});

/*Google Sign In*/
router.post('/google-sign', (req, res) => {
  const { body } = req;
  verify(body.idtoken)
    .then((data) => {
      User.findOne({ email: data.email }, (err, userFound) => {
        if (userFound == null) {
          const password_generated = generate.generate({
            length: 8,
            numbers: true,
          });
          const passwordEncrypted = bcrypt.hashSync(password_generated, 10);
          const user = new User();
          const generated_id = hat();
          (user.name = data.given_name),
            (user.nickname = `${data.name} [${generated_id}]`),
            (user.email = data.email),
            (user.image = data.picture),
            (user.role = 'USER'),
            (user.state = 'ACTIVE'),
            (user.google = true),
            (user.password = passwordEncrypted);

          user.save((err, userStored) => {
            return res.json({ ok: true, userStored });
          });
        } else {
          if (userFound.google) {
            const privateKey = fs.readFileSync(
              'Middlewares/private.key',
              'utf8'
            );
            const user = {
              name: userFound.name,
              nickname: userFound.nickname,
              email: userFound.email,
              _id: userFound._id,
              image: userFound.image,
              role: userFound.role,
              state: userFound.state,
              google: userFound.google,
            };
            jwt.sign(user, privateKey, (err, token) => {
              if (err) {
                return handleError(500, req, res, err);
              }
              return manageResponse(200, token, req, res);
            });
          } else {
            return handleError(404, req, res);
          }
        }
      });
    })
    .catch((err) => {
      throw new Error('There was an error');
    });
});
router.post('/upload', verifyToken, (req, res) => {
  const image = req.files.image;
  const user = req.user;
  if (!req.files) {
    return handleError(404, req, res);
  }
  const fileUploaded = manageImg(image.name);
  User.findOne({ _id: user._id }, (err, userFound) => {
    if (userFound.image != 'default.png' && userFound) {
      const deletedImg = fs.unlinkSync(`uploads/users/${userFound.image}`);
    }
    image.mv(`uploads/users/${fileUploaded}`, (err) => {
      if (err) {
        return handleError(500, req, res, err);
      }
    });
    User.findByIdAndUpdate(
      user._id,
      { image: fileUploaded },
      { new: true },
      (err, userUpdated) => {
        if (err) {
          return handleError(500, req, res, err);
        }
        return res.status(200).json({
          ok: true,
          image: `http://localhost:3000/users/${fileUploaded}`,
          userUpdated,
        });
      }
    );
  });
});
module.exports = router;
