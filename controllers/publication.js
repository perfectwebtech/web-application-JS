const express = require('express');
const app = express();
const Publication = require('../models/publication');
const { verifyToken } = require('../Middlewares/auth');
const _ = require('underscore');

/*Get all publications | HEAVY CONSUME |*/
app.get('/publications', (req, res) => {
  Publication.find({}, (err, publicationFound) => {
    if (err) {
      return res
        .status(500)
        .json({ ok: false, message: 'There was an internal error' });
    }
    if (!publicationFound) {
      return res
        .status(400)
        .json({ ok: false, message: 'No publications found' });
    }
    return res.status(200).json({ ok: true, message: publicationFound });
  });
});
/*Get one publication by id*/
app.get('/publications/:id', (req, res) => {
  const {
    params: { id }
  } = req;
  Publication.findById(id, (err, publicationFound) => {
    if (err) {
      return res
        .status(500)
        .json({ ok: false, message: 'There was an internal error' });
    }
    if (!publicationFound) {
      return res
        .status(400)
        .json({ ok: false, message: 'No publications found' });
    }
    return res.status(200).json({ ok: true, message: publicationFound });
  });
});
