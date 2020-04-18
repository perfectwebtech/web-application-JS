const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const publicationSchema = new Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  text: {
    required: true,
    type: String
  },
  createdAt: {
    type: Number
  },
  likes: {
    type: Number,
    required: true,
    default: 0
  },
  comments: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  },
  image: {
    type: String
  }
});
module.exports = mongoose.model('Publication', publicationSchema);
