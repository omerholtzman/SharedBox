import { describe, it, expect, beforeEach, beforeAll, afterAll, vi } from 'vitest';
import app from '../src/server';
import { StatusCodes } from 'http-status-codes';
import { connectDB, disconnectDB, getDB } from '../src/db';
import * as authMiddleware from '../src/middleware/authMiddleware';

vi.spyOn(authMiddleware, 'verifyToken').mockImplementation((req, reply, done) => done());

describe('groups', () => {
  const testGroup = {
    name: 'Test Group',
    description: 'A group for testing',
    password: 'test123',
  };

  beforeAll(async () => {
    await connectDB();
    await getDB().collection('groups').drop();
  });

  beforeEach(async () => {
    await getDB().collection('groups').drop();
    await app.inject({
      method: 'POST',
      url: '/groups',
      payload: testGroup,
    });
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
      };
  
      const response = await app.inject({
        method: 'POST',
        url: '/groups',
        payload: newGroup,
      });
  
      expect(response.statusCode).toBe(StatusCodes.CREATED);
      expect(response.json()).toEqual(newGroup);
    });

    it('should not allow duplicate group names', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/groups',
        payload: {
          name: testGroup.name,
          description: 'Duplicate group for testing',
          password: 'test456',
        },
      });
  
      expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
      expect(response.json()).toHaveProperty(
        'message', 'Group with this name already exists');
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

  describe('Multiple Operations on Groups', () => {
    it('should create, update, and delete a group in sequence', async () => {
      const newGroup = {
        name: 'Sequence Group',
        description: 'For testing multiple operations',
        password: 'test1234',
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
