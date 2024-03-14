/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

'use strict';
const Books = require('../book_model.js');

module.exports = async function (app) {
  app
    .route('/api/books')
    .get(async function (req, res) {
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      try {
        const allBooksInDb = await Books.find({});
        const allBooks = allBooksInDb.map(({ title, _id, comments }) => {
          return { title, _id, commentcount: comments.length };
        });
        res.json(allBooks);
      } catch (err) {
        res.status(500).send(err);
      }
    })

    .post(async function (req, res) {
      //response will contain new book object including atleast _id and title
      let title = req.body.title;
      try {
        if (title === undefined) return res.send('missing required field title');
        const { __v, ...bookInDb } = (await Books.create({ title: title })).toObject();
        res.send(bookInDb);
      } catch (err) {
        res.status(500).send(err);
      }
    })

    .delete(async function (req, res) {
      //if successful response will be 'complete delete successful'
      try {
        await Books.deleteMany({});
        res.send('complete delete successful');
      } catch (err) {
        res.status(500).send(err);
      }
    });

  app
    .route('/api/books/:id')
    .get(async function (req, res) {
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      let bookid = req.params.id;
      try {
        const book = await Books.findById(bookid, '-__v');
        if (book === null) return res.send('no book exists');
        res.json(book);
      } catch (err) {
        res.status(500).send(err);
      }
    })

    .post(async function (req, res) {
      //json res format same as .get
      try {
        let bookid = req.params.id;
        let comment = req.body.comment;
        if (comment === undefined) return res.send('missing required field comment');
        const bookInDb = await Books.findById(bookid, 'comments');
        if (bookInDb === null) return res.send('no book exists');
        bookInDb.comments.push(comment);
        const updatedBook = await Books.findByIdAndUpdate(
          bookid,
          { comments: bookInDb.comments },
          { returnDocument: 'after', select: '-__v', lean: true }
        );
        res.json(updatedBook);
      } catch (err) {
        res.status(500).send(err);
      }
    })

    .delete(async function (req, res) {
      //if successful response will be 'delete successful'
      try {
        let bookid = req.params.id;
        const bookInDb = await Books.findByIdAndDelete(bookid);
        if (bookInDb === null) return res.send('no book exists');
        res.send('delete successful');
      } catch (err) {
        res.status(500).send(err);
      }
    });
};
