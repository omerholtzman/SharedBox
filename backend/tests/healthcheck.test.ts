import { describe, it, expect, vi } from 'vitest';
import app from '../src/server.js';
import * as authMiddleware from '../src/middleware/authMiddleware';

vi.spyOn(authMiddleware, 'verifyToken').mockImplementation((req, reply, done) => done());

describe('GET /health', () => {
  it('should return a 200 status and ok message', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok' });
  });
});