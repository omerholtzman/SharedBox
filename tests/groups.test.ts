import { describe, it, expect, beforeEach, beforeAll, afterAll, vi } from 'vitest';
import app from '../src/server';
import { StatusCodes } from 'http-status-codes';
import { connectDB, disconnectDB, getDB } from '../src/db';
import * as authMiddleware from '../src/middleware/authMiddleware';
import { Group } from '../src/types/groups';
import { Collection } from 'mongodb';

vi.spyOn(authMiddleware, 'verifyToken').mockImplementation((req, reply, done) => done());

describe('groups', () => {
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

  describe('POST /groups', () => {
    it('should create a new group with name, description, and password', async () => {
      const newGroup = {
        name: 'Family',
        description: 'Family storage group',
        password: 'password123',
        opener: 'omer',
      };
  
      const response = await app.inject({
        method: 'POST',
        url: '/groups',
        payload: newGroup,
      });
  
      expect(response.statusCode).toBe(StatusCodes.CREATED);
      expect(response.json().members).toContain('omer');

      const group = await collection.findOne({ name: newGroup.name });
      expect(group).not.toBeNull();
    });

    it('should not allow duplicate group names', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/groups',
        payload: {
          name: testGroup.name,
          description: 'Duplicate group for testing',
          password: 'test456',
          opener: 'test',
        },
      });
  
      expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
      expect(response.json()).toHaveProperty(
        'message', 'Group with this name already exists');
    });

    it('should not allow create new group with missing details', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/groups',
        payload: {
          name: testGroup.name,
          description: 'Duplicate group for testing',
          opener: 'test',
        },
      });
  
      expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
      expect(response.json()).toHaveProperty('message', 'Validation Error');
    });
  });

  describe('GET /groups', () => {
    it('should return a list of groups', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/groups',
      });

      expect(response.statusCode).toBe(StatusCodes.OK);
      expect(response.json()).toBeInstanceOf(Array);
    });
  });

  describe('PATCH /groups/:name', () => {
    it('should update a group’s name and description', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: `/groups/${testGroup.name}`,
        payload: {
          name: 'Updated Group Name',
          description: 'Updated group description',
        },
      });

      expect(response.statusCode).toBe(StatusCodes.OK);
      const updatedGroup = response.json();
      expect(updatedGroup.name).toBe('Updated Group Name');
      expect(updatedGroup.description).toBe('Updated group description');
    });
  });

  describe('DELETE /groups/:name', () => {
    it('should delete the specified group', async () => {
      const deleteResponse = await app.inject({
        method: 'DELETE',
        url: `/groups/${testGroup.name}`,
      });

      expect(deleteResponse.statusCode).toBe(StatusCodes.NO_CONTENT);

      const getResponse = await app.inject({
        method: 'GET',
        url: `/groups/${testGroup.name}`,
      });

      expect(getResponse.statusCode).toBe(StatusCodes.NOT_FOUND);
    });
  });

  describe('POST /groups/:groupName/subscribe', () => {
    it('should allow a user to subscribe with the correct password', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/groups/${testGroup.name}/subscribe`,
        payload: { username: 'jane_doe', password: testGroup.password },
      });
  
      expect(response.statusCode).toBe(StatusCodes.OK);
      const group = await collection.findOne({ name: testGroup.name });
      expect(group?.members).toContain('jane_doe');
    });

    it('should not allow a user to subscribe twice', async () => {
      await app.inject({
        method: 'POST',
        url: `/groups/${testGroup.name}/subscribe`,
        payload: { username: 'jane_doe', password: testGroup.password },
      });

      const group = await collection.findOne({ name: testGroup.name });
      expect(group?.members).toContain('jane_doe');

      const response = await app.inject({
        method: 'POST',
        url: `/groups/${testGroup.name}/subscribe`,
        payload: { username: 'jane_doe', password: testGroup.password },
      });
  
      expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
      expect(response.json().message).toEqual('User already subscribed');
    });
    
    it('should return 401 for incorrect password', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/groups/${testGroup.name}/subscribe`,
        payload: { username: 'jane_doe', password: 'wrongpassword' },
      });
  
      expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
      const group = await collection.findOne({ name: testGroup.name });
      expect(group?.members).not.toContain('jane_doe');
    });

    it('should return 404 for group not found', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/groups/nonExistentGroup/subscribe',
        payload: { username: 'jane_doe', password: 'password' },
      });
  
      expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
      expect(response.json().message).toEqual('Group not found');
    });
  });
  
  describe('POST /groups/:groupName/unsubscribe', () => {
    it('should allow a user to unsubscribe', async () => {
      const memberToUnsubscribe = testGroup.members[0];

      const response = await app.inject({
        method: 'POST',
        url: `/groups/${testGroup.name}/unsubscribe`,
        payload: { username: memberToUnsubscribe },
      });
  
      expect(response.statusCode).toBe(StatusCodes.OK);
      const group = await collection.findOne({ name: testGroup.name });
      expect(group?.members).not.toContain(memberToUnsubscribe);
    });

    it('should return 404 if the group is not found', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/groups/nonExistentGroup/unsubscribe`,
        payload: { username: 'nonexistent_user' },
      });
  
      expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
      expect(response.json().message).toEqual('Group not found');
    });
  
    it('should return 404 if the user is not subscribed', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/groups/${testGroup.name}/unsubscribe`,
        payload: { username: 'nonexistent_user' },
      });
  
      expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
      expect(response.json().message).toEqual('User not subscribed');
    });
  });

  describe('Multiple Operations on Groups', () => {
    it('should create, update, and delete a group in sequence', async () => {
      const newGroup = {
        name: 'Sequence Group',
        description: 'For testing multiple operations',
        password: 'test1234',
        opener: 'test',
      };

      const createResponse = await app.inject({
        method: 'POST',
        url: '/groups',
        payload: newGroup,
      });


      expect(createResponse.statusCode).toBe(StatusCodes.CREATED);

      const patchResponse = await app.inject({
        method: 'PATCH',
        url: `/groups/${newGroup.name}`,
        payload: {
          name: 'Updated Sequence Group',
          description: 'Updated description for sequence test',
        },
      });

      expect(patchResponse.statusCode).toBe(StatusCodes.OK);
      const patchedGroup = patchResponse.json();
      expect(patchedGroup.name).toBe('Updated Sequence Group');

      const deleteResponse = await app.inject({
        method: 'DELETE',
        url: `/groups/Updated Sequence Group`,
      });

      expect(deleteResponse.statusCode).toBe(StatusCodes.NO_CONTENT);

      const getResponse = await app.inject({
        method: 'GET',
        url: `/groups/Updated Sequence Group`,
      });

      expect(getResponse.statusCode).toBe(StatusCodes.NOT_FOUND);
    });
  });
});
