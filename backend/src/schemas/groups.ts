import { z } from 'zod';

const groupSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    password: z.string(),
}).strict();

const updateGroupSchema = groupSchema.partial();

export { groupSchema, updateGroupSchema };