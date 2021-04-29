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

describe('POST /api/accounts', () => {
    it('prevents unauthenticated requests', async () => {
        const res = await request(app)
            .post('/api/accounts')
            .send({
                type: 'Checking'
            });

        expect(res.body.error).toBe('Please log in first');
    });

    it('creates accounts', async () => {
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
        
        expect(res2.body[0].transactions).toEqual([]);
        expect(res2.body[0]).toHaveProperty('_id');
        expect(res2.body[0].type).toEqual('Checking');
        expect(res2.body[0]).toHaveProperty('user');
        expect(res2.body[0].accountBalance).toEqual(0);
        expect(res2.body[0]).toHaveProperty('createdDate');
    });

    it("doesn't allow creating multiple copies of the same account type", async () => {
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
            .post('/api/accounts')
            .set('Authorization', `Bearer ${res.body.token}`)
            .send({
                type: 'Checking'
            });
        
        expect(res3.body.error).toBe('You already have a Checking account');
    });
});

describe('GET /api/accounts', () => {
    it('rejects unauthenticated requests', async () => {
        const res = await request(app)
            .get('/api/accounts');
        
        expect(res.body.error).toBe('Please log in first');
    });

    it('gets all accounts', async () => {
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
            .get('/api/accounts')
            .set('Authorization', `Bearer ${res.body.token}`);

        expect(res3.body[0].transactions).toEqual([]);
        expect(res3.body[0]).toHaveProperty('_id');
        expect(res3.body[0].type).toEqual('Checking');
        expect(res3.body[0]).toHaveProperty('user');
        expect(res3.body[0].accountBalance).toEqual(0);
        expect(res3.body[0]).toHaveProperty('createdDate');
    });
});

describe('DELETE /api/accounts/:accountId', () => {
    it('prevents unauthenticated requests', async () => {
        const res = await request(app)
            .delete('/api/accounts/12345');
        
        expect(res.body.error).toBe('Please log in first');
    });

    it('prevents unauthorized requests', async () => {
        const res = await request(app)
            .post('/api/auth/signup')
            .send({
                username: 'testUsername',
                password: 'testPassword'
            });

        const res2 = await request(app)
            .post('/api/auth/signup')
            .send({
                username: 'testUsername2',
                password: 'testPassword2'
            });

        const res3 = await request(app)
            .post('/api/accounts')
            .set('Authorization', `Bearing ${res.body.token}`)
            .send({
                type: 'Checking'
            });

        const res4 = await request(app)
            .delete(`/api/accounts/${res3.body[0]._id}`)
            .set('Authorization', `Bearing ${res2.body.token}`);
        
        expect(res4.body.error).toBe("You're not authorized to access that account");        
    });

    it('deletes accounts', async () => {
        const res = await request(app)
            .post('/api/auth/signup')
            .send({
                username: 'testUsername',
                password: 'testPassword'
            });

        const res2 = await request(app)
            .post('/api/accounts')
            .set('Authorization', `Bearing ${res.body.token}`)
            .send({
                type: 'Checking'
            });

        const res3 = await request(app)
            .delete(`/api/accounts/${res2.body[0]._id}`)
            .set('Authorization', `Bearer ${res.body.token}`);
        
        expect(res3.body).toEqual(res2.body[0]);
    });
});