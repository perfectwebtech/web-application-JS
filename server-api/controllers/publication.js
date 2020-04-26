const express = require('express');
const router = express.Router();
const Publication = require('../models/publication');
const { verifyToken } = require('../Middlewares/auth');
const {
  handleError,
  manageResponse,
  manageImg,
} = require('../Middlewares/utils');
const _ = require('underscore');
const fs = require('fs');

/*Get all publications | HEAVY CONSUME |*/
router.get('/publications', (req, res) => {
  Publication.find({}, (err, publicationFound) => {
    if (err) {
      return handleError(500, req, res);
    }
    if (!publicationFound) {
      return handleError(404, req, res);
    }
    return manageResponse(200, publicationFound, req, res);
  });
});
/*Get one publication by id*/
router.get('/publications/:id', (req, res) => {
  const {
    params: { id },
  } = req;
  Publication.findById(id, (err, publicationFound) => {
    if (err) {
      return handleError(500, req, res);
    }
    if (!publicationFound) {
      return handleError(404, req, res);
    }
    return manageResponse(200, publicationFound, req, res);
  });
});
router.get('/publications/users/:id', (req, res) => {
  const {
    params: { id },
  } = req;
  Publication.findOne({ creator: id }, (err, userFound) => {
    if (err) {
      return handleError(500, req, res);
    }
    if (!userFound) {
      return handleError(404, req, res);
    }
    return manageResponse(200, userFound, req, res);
  });
});
router.post('/publication', verifyToken, (req, res) => {
  const { body } = req;
  const publication = new Publication();
  const image = req.files.image;
  const pubToSave = {
    creator: req.user._id,
    text: body.text,
    createdAt: new Date().getTime(),
    likes: 0,
  };
  const fileUploaded = manageImg(image.name);
  publication.image = fileUploaded || null;
  publication.creator = pubToSave.creator;
  publication.text = pubToSave.text;
  publication.createdAt = pubToSave.createdAt;
  publication.likes = pubToSave.likes;
  publication.save({}, (err, pubStored) => {
    if (err) {
      return handleError(500, req, res);
    }
    if (!pubStored) {
      return handleError(404, req, res);
    }
    image.mv(`uploads/publications/${fileUploaded}`, (err) => {
      if (err) {
        return handleError(500, req, res, err);
      }
    });
    return res.status(200).json({
      ok: true,
      message: pubStored,
      image: `http://localhost:3000/publications/${fileUploaded}`,
    });
  });
});

router.delete('/publication/:id', verifyToken, (req, res) => {
  const {
    params: { id },
  } = req;
  const {
    user: { _id: userId },
  } = req;
  Publication.findOneAndDelete(
    { _id: id, creator: userId },
    (err, pubDeleted) => {
      if (err) {
        return handleError(500, req, res);
      }
      return res.status(200).json({ ok: true, message: pubDeleted });
    }
  );
});
/*TODO Check with socket.io likes status*/
module.exports = router;
