const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');

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

describe('GET /api/accounts/:accountId/transactions', () => {
    it('rejects unauthenticated requests', async () => {
        const res = await request(app)
            .get('/api/accounts/123/transactions');

        expect(res.body.error).toBe('Please log in first');
    });

    it('rejects unauthorized requests', async () => {
        const res = await request(app)
            .post('/api/auth/signup')
            .send({
                username: 'testUsername',
                password: 'testPassword'
            });

        const res2 = await request(app)
            .post('/api/accounts')
            .set('Authorization', `Bearer ${res.body.token}`)
            .send({
                type: 'Checking'
            });
        
        const res3 = await request(app)
            .post('/api/auth/signup')
            .send({
                username: 'testUsername2',
                password: 'testPassword2'
            });
        
        const res4 = await request(app)
            .get(`/api/accounts/${res2.body[0]._id}/transactions`)
            .set('Authorization', `Bearer ${res3.body.token}`);

        expect(res4.body.error).toBe("You're not authorized to access that resource");
    });

    it('gets transactions', async () => {
        const res = await request(app)
            .post('/api/auth/signup')
            .send({
                username: 'testUsername',
                password: 'testPassword'
            });

        const res2 = await request(app)
            .post('/api/accounts')
            .set('Authorization', `Bearer ${res.body.token}`)
            .send({
                type: 'Checking'
            });

        const res3 = await request(app)
            .post(`/api/accounts/${res2.body[0]._id}/transactions`)
            .set('Authorization', `Bearer ${res.body.token}`)
            .send({
                amount: 17.35,
                type: 'Deposit',
                description: 'A test transaction'
            });

        const res4 = await request(app)
            .get(`/api/accounts/${res2.body[0]._id}/transactions`)
            .set('Authorization', `Bearer ${res.body.token}`);

        expect(res4.body[0]).toHaveProperty('_id');
        expect(res4.body[0]).toHaveProperty('user');
        expect(res4.body[0].amount).toBe(17.35);
        expect(res4.body[0].description).toBe('A test transaction');
        expect(res4.body[0]).toHaveProperty('transactionNumber');
        expect(res4.body[0].accountBalance).toBe(17.35);
        expect(res4.body[0]).toHaveProperty('account');
        expect(res4.body[0]).toHaveProperty('date');
    });
});

describe('POST /api/accounts/:accountId/transactions', () => {
    it('rejects unauthenticated requests', async () => {
        const res = await request(app)
            .post('/api/accounts/123/transactions');

        expect(res.body.error).toBe('Please log in first');
    });

    it('creates transactions', async () => {
        const res = await request(app)
            .post('/api/auth/signup')
            .send({
                username: 'testUsername',
                password: 'testPassword'
            });

        const res2 = await request(app)
            .post('/api/accounts')
            .set('Authorization', `Bearer ${res.body.token}`)
            .send({
                type: 'Checking'
            });

        const res3 = await request(app)
            .post(`/api/accounts/${res2.body[0]._id}/transactions`)
            .set('Authorization', `Bearer ${res.body.token}`)
            .send({
                amount: 17.35,
                type: 'Deposit',
                description: 'A test transaction'
            });

        expect(res3.body[0]).toHaveProperty('_id');
        expect(res3.body[0]).toHaveProperty('user');
        expect(res3.body[0].amount).toBe(17.35);
        expect(res3.body[0].description).toBe('A test transaction');
        expect(res3.body[0]).toHaveProperty('transactionNumber');
        expect(res3.body[0].accountBalance).toBe(17.35);
        expect(res3.body[0]).toHaveProperty('account');
        expect(res3.body[0]).toHaveProperty('date');
    });

    it('rejects invalid requests', async () => {
        const res = await request(app)
            .post('/api/auth/signup')
            .send({
                username: 'testUsername',
                password: 'testPassword'
            });

        const res2 = await request(app)
            .post('/api/accounts')
            .set('Authorization', `Bearer ${res.body.token}`)
            .send({
                type: 'Checking'
            });

        const res3 = await request(app)
            .post(`/api/accounts/${res2.body[0]._id}/transactions`)
            .set('Authorization', `Bearer ${res.body.token}`)
            .send({
                type: 'Deposit',
                description: 'A test transaction'
            });
        
        expect(res3.body.error).toBe('Missing the following fields: amount');
    });
});

describe('POST /api/accounts/:accountId/transactions/generate/:num', () => {
    it('rejects unauthenticated requests', async () => {
        const res = await request(app)
            .post('/api/accounts/123/transactions/generate/5');

        expect(res.body.error).toBe('Please log in first');
    });

    it('rejects invalid numbers', async () => {
        const res = await request(app)
            .post('/api/auth/signup')
            .send({
                username: 'testUsername',
                password: 'testPassword'
            });

        const res2 = await request(app)
            .post('/api/accounts')
            .set('Authorization', `Bearer ${res.body.token}`)
            .send({
                type: 'Checking'
            });

        const res3 = await request(app)
            .post(`/api/accounts/${res2.body[0]._id}/transactions/generate/0`)
            .set('Authorization', `Bearer ${res.body.token}`);
        expect(res3.body.error).toBe('Number of transactions must be greater than or equal to 1');

        const res4 = await request(app)
            .post(`/api/accounts/${res2.body[0]._id}/transactions/generate/3.4`)
            .set('Authorization', `Bearer ${res.body.token}`);
        expect(res4.body.error).toBe('Number of transactions must be an integer');
    });
    
    it('generates random transactions', async () => {
        const res = await request(app)
            .post('/api/auth/signup')
            .send({
                username: 'testUsername',
                password: 'testPassword'
            });

        const res2 = await request(app)
            .post('/api/accounts')
            .set('Authorization', `Bearer ${res.body.token}`)
            .send({
                type: 'Checking'
            });

        const res3 = await request(app)
            .post(`/api/accounts/${res2.body[0]._id}/transactions/generate/3`)
            .set('Authorization', `Bearer ${res.body.token}`);

        expect(res3.body.length).toBe(3);
        expect(res3.body[0]).toHaveProperty('_id');
        expect(res3.body[0]).toHaveProperty('user');
        expect(res3.body[0]).toHaveProperty('amount');
        expect(res3.body[0]).toHaveProperty('description');
        expect(res3.body[0]).toHaveProperty('transactionNumber');
        expect(res3.body[0]).toHaveProperty('accountBalance');
        expect(res3.body[0]).toHaveProperty('account');
        expect(res3.body[0]).toHaveProperty('date');
        expect(res3.body[1]).toHaveProperty('_id');
        expect(res3.body[1]).toHaveProperty('user');
        expect(res3.body[1]).toHaveProperty('amount');
        expect(res3.body[1]).toHaveProperty('description');
        expect(res3.body[1]).toHaveProperty('transactionNumber');
        expect(res3.body[1]).toHaveProperty('accountBalance');
        expect(res3.body[1]).toHaveProperty('account');
        expect(res3.body[1]).toHaveProperty('date');
        expect(res3.body[2]).toHaveProperty('_id');
        expect(res3.body[2]).toHaveProperty('user');
        expect(res3.body[2]).toHaveProperty('amount');
        expect(res3.body[2]).toHaveProperty('description');
        expect(res3.body[2]).toHaveProperty('transactionNumber');
        expect(res3.body[2]).toHaveProperty('accountBalance');
        expect(res3.body[2]).toHaveProperty('account');
        expect(res3.body[2]).toHaveProperty('date');
    });
});