const express = require('express');
const router = express.Router();
const { io } = require('../../index');
const Publication = require('../../models/publication');
const { verifyToken } = require('../../Middlewares/auth');
io.on('connection', (client) => {
  console.log('succesfully connected');
  client.on('btnClicked', (data) => {
    console.log(data);
  });
});

module.exports = router;
