const express = require('express');
const router = express.Router();
const { io } = require('../../index');
io.on('connection', (client) => {
  console.log('succesfully connected');
});

module.exports = router;
