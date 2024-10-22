import { describe, it, expect, beforeEach, beforeAll, afterAll, vi } from 'vitest';
import app from '../src/server';
import { StatusCodes } from 'http-status-codes';
import { connectDB, disconnectDB, getDB } from '../src/db';
import * as authMiddleware from '../src/middleware/authMiddleware';
import { Group } from '../src/types/groups';
import { Collection } from 'mongodb';

vi.spyOn(authMiddleware, 'verifyToken').mockImplementation((req, reply, done) => done());

describe('users', () => {
  let collection: Collection<Group>;
  
  const testGroup = {
    name: 'Test Group',
    description: 'A group for testing',
    password: 'test123',
    members: ['omer'],
  };

  beforeAll(async () => {
    await connectDB();
    collection = getDB().collection<Group>('groups');
    await collection.drop();
  });

  beforeEach(async () => {
    await collection.drop();
    await collection.insertOne({ ...testGroup });
  });

  afterAll(async () => {
    await disconnectDB();
  });

  describe('GET /users/:username/groups', () => {
    it('should return groups the user is subscribed to', async () => {
      await collection.insertOne({...testGroup, name: 'new group',
         members: [...testGroup.members, 'another']});

      const response = await app.inject({
        method: 'GET',
        url: `/users/${testGroup.members[0]}/groups`,
      });
  
      expect(response.statusCode).toBe(StatusCodes.OK);
      expect(response.json()).toEqual([testGroup.name, 'new group']);
    });
  
    it('should return 404 if the user is not subscribed to any groups', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/users/unknown_user/groups',
      });
  
      expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
      expect(response.json()).toEqual({ message: 'No groups found for the user' });
    });
  });
});
