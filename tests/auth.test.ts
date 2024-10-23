import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import app from '../src/server';
import { StatusCodes } from 'http-status-codes';
import { connectDB, disconnectDB, getDB } from '../src/db';
import { beforeEach } from 'node:test';
import config from '../config';
import { User } from '../src/db/repositories/users';
import { Collection } from 'mongodb';

describe('Authentication', () => {
    describe('Authentication Routes', () => {
        let collection: Collection<User>;
        beforeAll(async () => {
            await connectDB();
            collection = getDB().collection<User>('users');
            await collection.drop();
        });
    
        beforeEach(async () => {
            await collection.drop();
        });
        
        afterAll(async () => {
            await collection.drop();
        });
    
        it('should allow a user to sign up', async () => {
            const response = await app.inject({
            method: 'POST',
            url: '/signup',
            payload: {
                username: 'testuser',
                password: 'testpassword',
            },
            });
            expect(response.statusCode).toBe(StatusCodes.CREATED);
            expect(response.json().message).toBe('User created');
        });
    
        it('should not allow duplicate sign-ups', async () => {
            await app.inject({
            method: 'POST',
            url: '/signup',
            payload: {
                username: 'btestuser',
                password: 'btestpassword',
            },
            });
    
            const duplicateResponse = await app.inject({
            method: 'POST',
            url: '/signup',
            payload: {
                username: 'btestuser',
                password: 'btestpassword',
            },
            });
    
            expect(duplicateResponse.statusCode).toBe(StatusCodes.BAD_REQUEST);
            expect(duplicateResponse.json().message).toBe('User already exists');
        });
    
        it('should allow a user to sign in with valid credentials', async () => {
            await app.inject({
                method: 'POST',
                url: '/signup',
                payload: {
                    username: 'ctestuser',
                    password: 'ctestpassword',
                },
            });
            
            const response = await app.inject({
            method: 'POST',
            url: '/signin',
            payload: {
                username: 'ctestuser',
                password: 'ctestpassword',
            },
            });
    
            expect(response.statusCode).toBe(StatusCodes.OK);
            expect(response.json().token).toBeTruthy();
        });
    
        it('should not allow a user to sign in with invalid credentials', async () => {
            const response = await app.inject({
            method: 'POST',
            url: '/signin',
            payload: {
                username: 'wronguser',
                password: 'wrongpassword',
            },
            });
    
            expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
            expect(response.json().message).toBe('Invalid credentials');
        });
    });
    
    const JWT_EXPIRE_TIME_IN_MS = config.JWT_EXPIRE_TIME.endsWith('s')
      ? parseInt(config.JWT_EXPIRE_TIME) * 1000
      : 15 * 60 * 1000;
    
    describe('Protected Route Access', () => {
        let collection: Collection<User>;
        
        beforeAll(async () => {
            await connectDB();
            collection = getDB().collection<User>('users'); 
            await collection.deleteMany({});
        });
    
        beforeEach(async () => {
            await collection.deleteMany({});            
        });
    
        afterAll(async () => {
            await disconnectDB();
        });
    
        it('should allow access to protected routes with a valid token', async () => {
            await app.inject({
            method: 'POST',
            url: '/signup',
            payload: {
                username: 'testuser',
                password: 'testpassword',
            },
            });
    
            const response = await app.inject({
            method: 'POST',
            url: '/signin',
            payload: {
                username: 'testuser',
                password: 'testpassword',
            },
            });
    
            const token = response.json().token;
    
            const getResponse = await app.inject({
            method: 'GET',
            url: '/groups',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            });
    
            expect(getResponse.statusCode).toBe(StatusCodes.OK);
        });
    
        it('should deny access to protected routes without a token', async () => {
            const response = await app.inject({
            method: 'GET',
            url: '/groups',
            });
    
            expect(response.statusCode).toBe(StatusCodes.FORBIDDEN);
            expect(response.json().message).toBe('No token provided');
        });
    
        it('should deny access to protected routes with an invalid token', async () => {
            const invalidToken = 'invalid.token.here';
            const response = await app.inject({
            method: 'GET',
            url: '/groups',
            headers: {
                Authorization: `Bearer ${invalidToken}`,
            },
            });
    
            expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
            expect(response.json().message).toBe('Invalid token');
        });
    
        it('should deny access to protected routes after the JWT expires', async () => {
            await app.inject({
            method: 'POST',
            url: '/signup',
            payload: {
                username: 'testuser',
                password: 'testpassword',
            },
            });
    
            const response = await app.inject({
            method: 'POST',
            url: '/signin',
            payload: {
                username: 'testuser',
                password: 'testpassword',
            },
            });
    
            const token = response.json().token;

            await new Promise((resolve) => 
                setTimeout(resolve, JWT_EXPIRE_TIME_IN_MS + 500));
        
            const getResponse = await app.inject({
              method: 'GET',
              url: '/groups',
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
        
            expect(getResponse.statusCode).toBe(StatusCodes.UNAUTHORIZED);
            expect(getResponse.json().message).toBe('Invalid token');
          }, JWT_EXPIRE_TIME_IN_MS + 5000);
    });
});
