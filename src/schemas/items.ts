import { ObjectId } from 'mongodb';
import { z } from 'zod';

const newItemSchema = z.object({
    name: z.string(),
    count: z.number().nonnegative(),
}).strict();

const updateItemCountSchema = z.object({
    count: z.number().nonnegative(),
}).strict();

const renameItemSchema = z.object({
    newName: z.string(),
}).strict();

const fullItemSchema = newItemSchema.extend({
    _id: z.instanceof(ObjectId),
    group: z.string(),
});

export { newItemSchema, updateItemCountSchema, renameItemSchema, fullItemSchema };