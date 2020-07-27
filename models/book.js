const mongoose = require('mongoose');

let bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  genre: { type: String },
  ISBN: { type: String, required: true , index: {unique: true}},
  authorId: { type: String, required: true, index: 1 },
  blurb: { type: String },
  publicationYear: { type: Number, required: true },
  pageCount: { type: Number, required: true }
});


bookSchema.index({title: 'text', genre: 'text', blurb: 'text'})
module.exports = mongoose.model("books", bookSchema);
