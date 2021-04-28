const app = require('../server');
const request = require('supertest');
const mongoose = require('mongoose');
const Users = require('../models/users');

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

describe('/api/auth/signup', () => {
    it('creates new accounts', async () => {
        const res = await request(app)
            .post('/api/auth/signup')
            .send({
                username: 'testUsername',
                password: 'testPassword'
            });
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('joinDate');
        expect(res.body).toHaveProperty('token');
        expect(res.body.username).toBe('testUsername');
    });

    it('rejects invalid requests', async () => {
        const res = await request(app)
            .post('/api/auth/signup')
            .send({
                username: 'testUsername'
            });
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('Missing the following fields: password');
    });
});

describe('/api/auth/signin', () => {
    it('logs into existing accounts', async () => {
        const res = await request(app)
            .post('/api/auth/signup')
            .send({
                username: 'testUsername',
                password: 'testPassword'
            });

        const res2 = await request(app)
            .post('/api/auth/signin')
            .send({
                username: 'testUsername',
                password: 'testPassword'
            });
        expect(res2.statusCode).toBe(200);
        expect(res2.body).toHaveProperty('joinDate');
        expect(res2.body).toHaveProperty('token');
        expect(res2.body.username).toBe('testUsername');
    });

    it('rejects incorrect passwords', async () => {
        const res = await request(app)
            .post('/api/auth/signup')
            .send({
                username: 'testUsername',
                password: 'testPassword'
            });

        const res2 = await request(app)
            .post('/api/auth/signin')
            .send({
                username: 'testUsername',
                password: 'wrongPassword'
            });
        expect(res2.statusCode).toBe(401);
        expect(res2.body.error).toBe('Incorrect password');
    });
});

describe('/api/auth/changePassword', () => {
    it('rejects requests missing fields', async () => {
        const res = await request(app)
            .post('/api/auth/signup')
            .send({
                username: 'testUsername',
                password: 'testPassword'
            });

        const res2 = await request(app)
            .post('/api/auth/changePassword')
            .set('Authorization', `Bearer ${res.body.token}`)
            .send({
                currentPassword: 'testPassword',
                newPassword: 'aNewPassword'
            });
        expect(res2.statusCode).toBe(400);
        expect(res2.body.error).toBe('Missing the following fields: repeatNewPassword');
    });

    it('rejects unauthorized requests', async () => {
        const res = await request(app)
            .post('/api/auth/signup')
            .send({
                username: 'testUsername',
                password: 'testPassword'
            });

        const res2 = await request(app)
            .post('/api/auth/changePassword')
            .send({
                currentPassword: 'testPassword',
                newPassword: 'aNewPassword',
                repeatNewPassword: 'aNewPassword'
            });
        expect(res2.statusCode).toBe(401);
        expect(res2.body.error).toBe('Please log in first');
    });
    
    it('changes passwords', async () => {        
        const res = await request(app)
            .post('/api/auth/signup')
            .send({
                username: 'testUsername',
                password: 'testPassword'
            });

        const res2 = await request(app)
            .post('/api/auth/changePassword')
            .set('Authorization', `Bearer ${res.body.token}`)
            .send({
                currentPassword: 'testPassword',
                newPassword: 'aNewPassword',
                repeatNewPassword: 'aNewPassword'
            });
        expect(res2.body.message).toBe('Successfully changed your password');

        await new Promise(resolve => setTimeout(resolve, 200));

        const res3 = await request(app)
            .post('/api/auth/signin')
            .send({
                username: 'testUsername',
                password: 'aNewPassword'
            });
        expect(res3.statusCode).toBe(200);
        expect(res3.body).toHaveProperty('joinDate');
        expect(res3.body).toHaveProperty('token');
        expect(res3.body.username).toBe('testUsername');
    });

    it('verifies original password', async () => {        
        const res = await request(app)
            .post('/api/auth/signup')
            .send({
                username: 'testUsername',
                password: 'testPassword'
            });

        const res2 = await request(app)
            .post('/api/auth/changePassword')
            .set('Authorization', `Bearer ${res.body.token}`)
            .send({
                currentPassword: 'notTheRightPassword',
                newPassword: 'aNewPassword',
                repeatNewPassword: 'aNewPassword'
            });
        expect(res2.statusCode).toBe(401);
        expect(res2.body.error).toBe('Incorrect password');
    });

    it('verifies new passwords match', async () => {        
        const res = await request(app)
            .post('/api/auth/signup')
            .send({
                username: 'testUsername',
                password: 'testPassword'
            });

        const res2 = await request(app)
            .post('/api/auth/changePassword')
            .set('Authorization', `Bearer ${res.body.token}`)
            .send({
                currentPassword: 'testPassword',
                newPassword: 'aNewPassword',
                repeatNewPassword: 'aDifferentNewPassword'
            });
        expect(res2.statusCode).toBe(400);
        expect(res2.body.error).toBe('New passwords must match');
    });
});