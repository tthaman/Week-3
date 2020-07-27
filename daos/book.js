const mongoose = require('mongoose');

const Book = require('../models/book');

module.exports = {};

module.exports.getAll = (page, perPage, searchTerm) => {
  if (searchTerm) {
    const res = Book.find(
    { $text: { $search: searchTerm } },
    { score: { $meta: "textScore" } }
  )
    .sort({ score: { $meta: "textScore" } })
    .limit(perPage).skip(perPage*page).lean();
    return res;
  } else {
    return Book.find().limit(perPage).skip(perPage*page).lean();
  }
}

module.exports.getAuthorStats = (authorInfo) => {
  if (authorInfo) {
    return Book.aggregate([
      {$group: {
        _id: '$authorId',
        numBooks: {$sum: 1}, titles: {$push: '$title'},
        averagePageCount: {$avg: "$pageCount"}
      }},
      {$addFields: {
        convertedId: { $toObjectId: '$_id' }
      }},
      {$lookup: {
        from: 'authors',
        localField: 'convertedId',
        foreignField: '_id',
        as: 'author'
      }},
      {$project: {_id: 0, authorId: '$convertedId', averagePageCount: 1, numBooks: 1, titles: 1, author: 1}},
      {$sort: {authorId: 1}},
      {$unwind: '$author'}
    ])
  } else {
    return Book.aggregate([
      {$group: {
        _id: '$authorId',
        numBooks: {$sum: 1}, titles: {$push: '$title'},
        averagePageCount: {$avg: "$pageCount"}
      }},
      {$project: {_id: 0, authorId: '$_id', averagePageCount: 1, numBooks: 1, titles: 1}},
      {$sort: {authorId: 1}},
    ]);
  }
}
module.exports.getById = (bookId) => {
  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return null;
  }
  return Book.findOne({ _id: bookId }).lean();
}

module.exports.getBooksByAuthorId = async (authorId) => {
  return Book.find({ authorId: authorId }).lean();
}

module.exports.deleteById = async (bookId) => {
  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return false;
  }
  await Book.deleteOne({ _id: bookId });
  return true;
}

module.exports.updateById = async (bookId, newObj) => {
  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return false;
  }
  await Book.updateOne({ _id: bookId }, newObj);
  return true;
}

module.exports.create = async (bookData) => {
  try {
    const created = await Book.create(bookData);
    return created;
  } catch (e) {
    if (e.message.includes('validation failed') || e.message.includes('duplicate') ) {
      throw new BadDataError(e.message);
    }
    throw e;
  }
}

class BadDataError extends Error {}
module.exports.BadDataError = BadDataError;
