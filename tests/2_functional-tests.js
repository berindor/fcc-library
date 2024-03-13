/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *
 */

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const mongoose = require('mongoose');
const Books = require('../book_model.js');

chai.use(chaiHttp);

suite('Functional Tests', function () {
  /*
   * ----[EXAMPLE TEST]----
   * Each test should completely test the response of the API end-point including response status code!
   */
  test('#example Test GET /api/books', function (done) {
    chai
      .request(server)
      .get('/api/books')
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body, 'response should be an array');
        assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
        assert.property(res.body[0], 'title', 'Books in array should contain title');
        assert.property(res.body[0], '_id', 'Books in array should contain _id');
        done();
      });
  });
  /*
   * ----[END of EXAMPLE TEST]----
   */

  suite.only('Delete test data', function () {
    test('Test delete all data in the db', function (done) {
      chai
        .request(server)
        .delete('/api/delete-testdata')
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'successfully deleted all test data');
        });
      chai
        .request(server)
        .get('/api/books')
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.length, 0);
          done();
        });
    });
  });

  let testData = [{ title: 'Test title 0' }, { title: 'Test title 1' }];

  suite('Routing tests', function () {
    suite.only('POST /api/books with title => create book object/expect book object', function () {
      test('Test POST /api/books with title', function (done) {
        const testTitle = testData[0].title;
        chai
          .request(server)
          .post('/api/books')
          .send({ title: testTitle })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.title, testTitle);
            assert.isOk(mongoose.isValidObjectId(res.body._id));
            testData[0]._id = res.body._id;
            done();
          });
      });

      test('Test POST /api/books with no title given', function (done) {
        chai
          .request(server)
          .post('/api/books')
          .send({})
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'missing required field title');
            done();
          });
      });
    });

    suite.only('GET /api/books => array of books', function () {
      test('Test GET /api/books', function (done) {
        const testTitle = testData[1].title;
        chai
          .request(server)
          .post('/api/books')
          .send({ title: testTitle })
          .end(function (err, res) {
            assert.equal(res.status, 200);
          });
        chai
          .request(server)
          .get('/api/books')
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.deepInclude(res.body[res.body.length - 1], { title: testTitle, commentcount: 0 });
            assert.isOk(mongoose.isValidObjectId(res.body[0]._id));
            testData[1]._id = res.body[res.body.length - 1]._id;
            done();
          });
      });
    });

    suite.only('GET /api/books/[id] => book object with [id]', function () {
      test('Test GET /api/books/[id] with id not in db', function (done) {
        const invalidId = new mongoose.Types.ObjectId().toString();
        chai
          .request(server)
          .get(`/api/books/${invalidId}`)
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'no book exists');
            done();
          });
      });

      test('Test GET /api/books/[id] with valid id in db', function (done) {
        const validId = testData[0]._id;
        console.log('testData: ', testData);
        chai
          .request(server)
          .get(`/api/books/${validId}`)
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.hasAllKeys(res.body, ['title', '_id', 'comments']);
            assert.deepInclude(res.body, testData[0]);
            assert.deepEqual(res.body.comments, []);
            done();
          });
      });
    });

    suite('POST /api/books/[id] => add comment/expect book object with id', function () {
      test('Test POST /api/books/[id] with comment', function (done) {
        //done();
      });

      test('Test POST /api/books/[id] without comment field', function (done) {
        //done();
      });

      test('Test POST /api/books/[id] with comment, id not in db', function (done) {
        //done();
      });
    });

    suite('DELETE /api/books/[id] => delete book object id', function () {
      test('Test DELETE /api/books/[id] with valid id in db', function (done) {
        //done();
      });

      test('Test DELETE /api/books/[id] with  id not in db', function (done) {
        //done();
      });
    });
  });
});
