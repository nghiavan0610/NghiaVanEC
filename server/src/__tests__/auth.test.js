const request = require('supertest');
const { createServer } = require('../configs/server');
const { User, Job } = require('../db/models');
const bcrypt = require('bcrypt');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../helpers/Token');
const redisClient = require('../configs/init.redis');

const app = createServer();

beforeEach(async () => {
    await User.deleteMany();
    await redisClient.flushAll();
});

const mockUser = { username: 'admin', name: 'Admin', password: 'p4ssword', slug: 'admin' };
const credentials = { username: 'admin', password: 'p4ssword' };

const addUser = async (user = { ...mockUser }) => {
    await User.create(user);
};

const signIn = async (credentials) => {
    return await request(app).post('/v1/auth/signin').send(credentials);
};

const signOut = async (accessToken) => {
    return await request(app).get('/v1/auth/signout').set('Authorization', `Bearer ${accessToken}`);
};

describe('Sign In', () => {
    it('return 200, accessToken, refreshToken and info user with correct name when credentials are correct', async () => {
        await addUser();
        const response = await signIn(credentials);
        expect(response.status).toBe(200);
        expect(response.body.data).toHaveProperty('accessToken');
        expect(response.body.data).toHaveProperty('refreshToken');
        expect(response.body.data).toHaveProperty('user');
        expect(response.body.data.user.name).toBe(mockUser.name);
    });
    it('return 403 if account has been disabled', async () => {
        await addUser({ ...mockUser, deleted: true });
        const response = await signIn(credentials);
        expect(response.status).toBe(403);
        expect(response.body.message).toBe('This account has been disabled');
    });
    it('return 401 if invalid username or password', async () => {
        const response = await signIn(credentials);
        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Invalid username or password');
    });
});

describe('Authentication', () => {
    it('return 401 when request header do not have authorization', async () => {
        await addUser();
        const response = await request(app).get('/v1/auth/signout');
        expect(response.status).toBe(401);
        expect(response.body.message).toBe(`Invalid authorization`);
    });
    it('return 401 when invalid signature', async () => {
        await addUser();
        const response = await signOut('test');
        expect(response.status).toBe(401);
        expect(response.body.message).toBe(`Invalid signature`);
    });
    it('return 401 when no access token in authorization', async () => {
        await addUser();
        const response = await signOut('undefined');
        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Access Token was not found');
    });
    it('return 401 when access token has been revoked', async () => {
        await addUser();
        const {
            body: {
                data: { accessToken },
            },
        } = await signIn(credentials);
        await signOut(accessToken);
        const response = await signOut(accessToken);
        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Access token has been revoked');
    });
});

describe('Refresh token', () => {
    const createNewToken = async (refreshToken) => {
        return await request(app).post('/v1/auth/refresh-token').set('Authorization', `Bearer ${refreshToken}`);
    };

    it('return 201, new accesss token when refresh token is valid', async () => {
        await addUser();
        const {
            body: {
                data: { accessToken, refreshToken },
            },
        } = await signIn(credentials);
        const oldAccessToken = accessToken;
        const response = await createNewToken(refreshToken);
        expect(response.status).toBe(201);
        expect(response.body.data).toHaveProperty('accessToken');
    });
    it('return 401 when the refresh token was not found', async () => {
        await addUser();
        const response = await createNewToken();
        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Refresh Token was not found');
    });
    it('return 401 when the refresh token is revoked', async () => {
        await addUser();
        const {
            body: {
                data: { accessToken, refreshToken },
            },
        } = await signIn(credentials);
        await signOut(accessToken);

        const response = await createNewToken(refreshToken);
        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Refresh Token has been revoked');
    });
});

describe('Sign Out', () => {
    it('return 200 and log out account', async () => {
        await addUser();
        const {
            body: {
                data: { accessToken },
            },
        } = await signIn(credentials);
        const response = await signOut(accessToken);
        expect(response.status).toBe(200);
        expect(response.body.data).toBe(`You've been logged out`);
    });
    it('return 401 and can not access by old access token after signout', async () => {
        await addUser();
        const {
            body: {
                data: { accessToken },
            },
        } = await signIn(credentials);
        await signOut(accessToken);
        const response = await signOut(accessToken);
        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Access token has been revoked');
    });
});
