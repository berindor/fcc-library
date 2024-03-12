const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  comments: [String]
});

const Books = mongoose.model('Books', bookSchema);

module.exports = Books;
