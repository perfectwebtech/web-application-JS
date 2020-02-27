const express = require('express');
const app = express();
const Follow = require('../models/follows');
const User = require('../models/follows');
const { verifyToken } = require('../Middlewares/auth');
const _ = require('underscore');

//TODO Get users that are following you and that you follow
app.get('/follow', (req, res) => {
  //do staff
});

/*Follow someone by id*/
//TODO check parameters before sending to DB
app.post('/follow/:id', verifyToken, (req, res) => {
  const {
    params: { id }
  } = req;
  const user = req.user;
  if (id != user._id) {
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
  } else {
    return res
      .status(400)
      .json({ ok: true, message: 'You cant follow yourself' });
  }
});

//TODO Delete a follow
app.delete('/follow/:id', (req, res) => {
  //do staff
});

module.exports = app;
