import { afterAll, beforeAll } from 'vitest';
import { connectDB, disconnectDB } from '../src/db';

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await disconnectDB();
});
