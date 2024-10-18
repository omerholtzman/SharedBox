import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest';
import app from '../src/server.js';
import { getDB, connectDB, disconnectDB } from '../src/db';
import * as authMiddleware from '../src/middleware/authMiddleware';
import { StatusCodes } from 'http-status-codes';
import { Item } from '../src/types/items.js';
import { Collection } from 'mongodb';

vi.spyOn(authMiddleware, 'verifyToken').mockImplementation((req, reply, done) => done());

describe('items', () => {
    let collection: Collection<Item>;

    beforeEach(async () => {
        await collection.drop();
        await collection.insertMany([
          { name: 'Tent', count: 5, group: 'Outdoor Gear' },
          { name: 'Sleeping Bag', count: 3, group: 'Outdoor Gear' },
        ]);
      });
    
    beforeAll(async () => {
        await connectDB();
        const db = getDB();
        collection = db.collection<Item>('items');
    });

    afterAll(async () => {
        await disconnectDB();
    });
    
    describe('GET /groups/:groupName/items', () => {
        it('should return a list of items for the given group', async () => {
            const response = await app.inject({
            method: 'GET',
            url: '/groups/Outdoor Gear/items',
            });
        
            expect(response.statusCode).toBe(StatusCodes.OK);
            expect(response.json()).toEqual([
            { name: 'Tent', count: 5 },
            { name: 'Sleeping Bag', count: 3 },
            ]);
        });
    });  
    
    describe('POST /groups/:groupName/items', () => {
        it('should add a new item to the group', async () => {
            const itemsCountBefore = await collection.countDocuments();

            const response = await app.inject({
                method: 'POST',
                url: '/groups/Outdoor Gear/items',
                payload: { name: 'Backpack', count: 10 },
            });
        
            expect(response.statusCode).toBe(StatusCodes.CREATED);
            expect(response.json()).toEqual({ message: 'Item added successfully' });

            const itemsCountAfter = await collection.countDocuments();
            expect(itemsCountBefore + 1).toEqual(itemsCountAfter);
        });
      
        it('should return 400 if the item already exists', async () => {
          await app.inject({
            method: 'POST',
            url: '/groups/Outdoor Gear/items',
            payload: { name: 'Tent', count: 5 },
          });
          
          const itemsCountBefore = await collection.countDocuments();
          const response = await app.inject({
            method: 'POST',
            url: '/groups/Outdoor Gear/items',
            payload: { name: 'Tent', count: 3 },
          });
      
          expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(response.json()).toEqual({ message: 'Item already exists' });
          const itemsCountAfter = await collection.countDocuments();
          expect(itemsCountBefore).toEqual(itemsCountAfter);
        });
      });
    
    describe('PATCH /groups/:groupName/items/:itemName', () => {
        it('should update the item count', async () => {
          const groupName = "Outdoor Gear";
          const itemName = "Tent";
          const newCount = 10;

          const response = await app.inject({
            method: 'PATCH',
            url: `/groups/${groupName}/items/${itemName}`,
            payload: { count: newCount },
          });
      
          expect(response.statusCode).toBe(StatusCodes.OK);
          expect(response.json()).toEqual({ message: 'Item updated successfully' });
          
          const itemAfterChange = await collection
            .findOne({group: groupName, name: itemName});
          expect(itemAfterChange?.count).toEqual(newCount);
        });
      
        it('should return 404 if the item does not exist', async () => {
          const response = await app.inject({
            method: 'PATCH',
            url: '/groups/Outdoor Gear/items/Nonexistent Item',
            payload: { count: 5 },
          });
      
          expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
          expect(response.json()).toEqual({ message: 'Item not found' });
        });
    });
    
    describe('PUT /groups/:groupName/items/:itemName', () => {
        it('should rename the item', async () => {
            const groupName = "Outdoor Gear";
            const itemName = "Tent";
            const newName = "Big Tent";
  
            const response = await app.inject({
                method: 'PUT',
                url: `/groups/${groupName}/items/${itemName}`,
                payload: { newName },
            });
            
            expect(response.statusCode).toBe(StatusCodes.OK);
            expect(response.json()).toEqual({ message: 'Item renamed successfully' });
            const itemAfterChange = await collection
              .findOne({group: groupName, name: newName});
            expect(itemAfterChange).not.toBeNull();
        });
      
        it('should return 404 if the item does not exist', async () => {
          const response = await app.inject({
            method: 'PUT',
            url: '/groups/Outdoor Gear/items/Nonexistent Item',
            payload: { newName: 'Something' },
          });
      
          expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
          expect(response.json()).toEqual({ message: 'Item not found' });
        });
    });
    
    describe('DELETE /groups/:groupName/items/:itemName', () => {
        it('should delete the item', async () => {
          const countBefore = await collection.countDocuments();

          const response = await app.inject({
            method: 'DELETE',
            url: '/groups/Outdoor Gear/items/Tent',
          });
      
          expect(response.statusCode).toBe(StatusCodes.NO_CONTENT);
          
          const countAfter = await collection.countDocuments();
          expect(countAfter + 1).toEqual(countBefore);
        });
      
        it('should return 404 if the item does not exist', async () => {
          const response = await app.inject({
            method: 'DELETE',
            url: '/groups/Outdoor Gear/items/Nonexistent Item',
          });
      
          expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
          expect(response.json()).toEqual({ message: 'Item not found' });
        });
    });
      
});