import request from 'supertest';
import app from "../app";
import pool from "./db"

import { closePool } from './db';

test('Create a user', async () => {
    const res = await request(app)
        .post('/api/auth/register')
        .send({
            name: 'test',
            email: 'jesttest@jest.com',
            password: 'password'
        })
        .expect(201)

    expect(res.body.user).toMatchObject({
        name: 'test',
        email: 'jesttest@jest.com'
    });
});

test('Login a user', async () => {
    const res = await request(app)
        .post('/api/auth/login')
        .send({
            email: 'jesttest@jest.com',
            password: 'password'
        })
        .expect(200)

        expect(res.body.user).toMatchObject({
            name: 'test',
            email: 'jesttest@jest.com'
        });
})

test('Attempt to register a duplicate user', async () => {
    const res = await request(app)
        .post('/api/auth/register')
        .send({
            name: 'test',
            email: 'jesttest@jest.com',
            password: 'password'
        })
        .expect(409)

    expect(res.body).toEqual({
        error: "User already exists"
    });
});

test('Attempt to login with invalid credentials', async () => {
    const res = await request(app)
        .post('/api/auth/login')
        .send({
            email: 'invalid@jest.com',
            password: 'what'
        })
        .expect(401)

    expect(res.body).toEqual({
        error: "Invalid credentials"
    });
});


afterAll(async () => {
    await pool.query('DELETE FROM users WHERE email = $1', ['jesttest@jest.com'])
    await closePool(); // Cleanup
});
