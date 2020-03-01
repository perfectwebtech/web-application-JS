const express = require('express');
const app = express();
const Follow = require('../models/follows');
const User = require('../models/follows');
const { verifyToken } = require('../Middlewares/auth');
const _ = require('underscore');

app.get('/follow', verifyToken, (req, res) => {
  const user = req.user;
  const { query } = req;
  if (query.count == 'true') {
    Follow.count({ followed: user._id }, (err, followers) => {
      Follow.count({ following: user._id }, (err, following) => {
        return res.status(200).json({ ok: true, followers, following });
      });
    });
  } else {
    Follow.find({ followed: user._id }, (err, followers) => {
      Follow.find({ following: user._id }, (err, following) => {
        if (err) {
          return res
            .status(500)
            .json({ ok: false, message: 'Something went wrong' });
        }
        if (!followers || !following) {
          return res
            .status(400)
            .json({ ok: false, message: 'Follows couldnt be found' });
        }
        return res.status(200).json({ ok: true, followers, following });
      });
    });
  }
});

/*Follow someone by id*/
app.post('/follow/:id', verifyToken, (req, res) => {
  const {
    params: { id }
  } = req;
  const user = req.user;
  if (id != user._id) {
    Follow.findOne(
      { following: user._id, followed: id },
      (err, followFound) => {
        if (followFound) {
          return res.status(400).json({
            ok: false,
            message: 'You are already following this person'
          });
        }
        if (err) {
          return res
            .status(500)
            .json({ ok: false, message: 'Something went wrong' });
        }
        const follow = new Follow();
        follow.following = user._id;
        follow.followed = id;
        follow.createdAt = new Date().getFullYear();

        follow.save((err, userSaved) => {
          if (err) {
            return res
              .status(500)
              .json({ ok: false, message: 'Something went wrong' });
          }
          return res.status(200).json({ ok: true, message: userSaved });
        });
      }
    );
  } else {
    return res
      .status(400)
      .json({ ok: true, message: 'You cant follow yourself' });
  }
});

/*Delete a follow*/
app.delete('/follow/:id', verifyToken, (req, res) => {
  const {
    params: { id }
  } = req;
  const user = req.user;
  Follow.findOne({ following: user._id, followed: id })
    .populate('following')
    .exec((err, followFound) => {
      if (err) {
        return res
          .status(500)
          .json({ ok: false, message: 'Something went wrong' });
      }
      if (!followFound) {
        return res.status(400).json({ ok: false, message: 'Follow not found' });
      }
      Follow.findByIdAndDelete(followFound._id, (err, documentDeleted) => {
        if (err) {
          return res
            .status(500)
            .json({ ok: false, message: 'Something went wrong' });
        }
        return res.status(200).json({ ok: true, mesage: documentDeleted });
      });
    });
});

module.exports = app;
