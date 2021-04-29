const app = require('../server');
const request = require('supertest');
const mongoose = require('mongoose');

beforeEach(done => {
    mongoose.connect('mongodb://localhost/bow-tests', {
        useNewUrlParser: true, 
        useUnifiedTopology: true, 
        useFindAndModify: false, 
        keepAlive: true
    }, () => done());
});

afterEach(done => {
    mongoose.connection.db.dropDatabase(() => {
        mongoose.connection.close(() => done());
    });
});

describe('invalid paths', () => {
    it("rejects paths that don't exist", async () => {
        const res = await request(app)
            .get('/thispath/doesntexist');
        expect(res.body.error).toBe('Route not found');
    });
});