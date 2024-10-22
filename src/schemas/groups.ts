import { z } from 'zod';

const groupSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    password: z.string(),
    members: z.array(z.string()),
}).strict();

const updateGroupSchema = groupSchema.partial();

const newGroupSchema = groupSchema
    .omit({members: true})
    .extend({ opener: z.string() });

const subscribeUserSchema = z.object({
    username: z.string(),
    password: z.string(),
});

const unsubscribeUserSchema = z.object({
    username: z.string(),
});

export { 
    groupSchema,
    updateGroupSchema,
    newGroupSchema,
    subscribeUserSchema,
    unsubscribeUserSchema
};