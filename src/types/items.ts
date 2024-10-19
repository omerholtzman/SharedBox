
import { z } from 'zod';
import { fullItemSchema, newItemSchema } from '../schemas/items';

export type Item = z.infer<typeof fullItemSchema>
export type GroupItem = z.infer<typeof newItemSchema>
