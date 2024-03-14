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

chai.use(chaiHttp);

suite('Functional Tests', function () {
  /*
   * ----[EXAMPLE TEST]----
   * Each test should completely test the response of the API end-point including response status code!
  
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
   * ----[END of EXAMPLE TEST]----
   */

  //extra test for deleting all books
  /*
  suite('Delete all books', function () {
    test('DELETE /api/books => deletes all books', function (done) {
      chai
        .request(server)
        .delete('/api/books')
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'complete delete successful');
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
  */

  let testData = [{ title: 'Test title 0' }, { title: 'Test title 1' }];

  suite('Routing tests', function () {
    suite('POST /api/books with title => create book object/expect book object', function () {
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

    suite('GET /api/books => array of books', function () {
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

    suite('GET /api/books/[id] => book object with [id]', function () {
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
        const validId = testData[0]._id;
        const testComment = 'test comment 0';
        testData[0].comments = [testComment];
        chai
          .request(server)
          .post(`/api/books/${validId}`)
          .send({ id: validId, comment: testComment })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.hasAllKeys(res.body, ['title', '_id', 'comments']);
            assert.deepInclude(res.body, testData[0]);
            done();
          });
      });

      test('Test POST /api/books/[id] without comment field', function (done) {
        const validId = testData[0]._id;
        chai
          .request(server)
          .post(`/api/books/${validId}`)
          .send({ id: validId })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'missing required field comment');
            done();
          });
      });

      test('Test POST /api/books/[id] with comment, id not in db', function (done) {
        const invalidId = new mongoose.Types.ObjectId().toString();
        chai
          .request(server)
          .post(`/api/books/${invalidId}`)
          .send({ id: invalidId, comment: 'new comment' })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'no book exists');
            done();
          });
      });
    });

    suite('DELETE /api/books/[id] => delete book object id', function () {
      test('Test DELETE /api/books/[id] with valid id in db', function (done) {
        const validId = testData[0]._id;
        chai
          .request(server)
          .delete(`/api/books/${validId}`)
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'delete successful');
          });
        chai
          .request(server)
          .get(`/api/books/${validId}`)
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'no book exists');
          });
        //to delete the data, so all test data is deleted from the db at the end
        chai
          .request(server)
          .delete(`/api/books/${testData[1]._id}`)
          .end(function (err, res) {
            assert.equal(res.status, 200);
          });
        chai
          .request(server)
          .get(`/api/books/${testData[1]._id}`)
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'no book exists');
            done();
          });
      });

      test('Test DELETE /api/books/[id] with  id not in db', function (done) {
        const invalidId = new mongoose.Types.ObjectId().toString();
        chai
          .request(server)
          .delete(`/api/books/${invalidId}`)
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'no book exists');
            done();
          });
      });
    });
  });
});
