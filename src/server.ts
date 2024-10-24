import Fastify from 'fastify';
import basicRoutes from './routes/basic';
import groupRoutes from './routes/groups';
import authRoutes from './routes/auth';
import itemRoutes from './routes/items';
import cors from '@fastify/cors';

import { verifyToken } from './middleware/authMiddleware';

import config from '../config';
import { handleError } from './middleware/errorHandler';
import userRoutes from './routes/users';
 
const app = Fastify({ logger: true });

app.setErrorHandler((error, _request, reply) => {
  handleError(reply, error);
});

app.addHook('preHandler', (req, reply, done) => {
  const publicRoutes = ['/signup', '/signin', '/signout'];
  if (publicRoutes.includes(req.routeOptions.url!)) {
    return done();
  }
  return verifyToken(req, reply, done);
});

app.register(cors, {
  origin: config.CORS_ORIGIN,
  credentials: true,               
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
});

app.register(authRoutes);
app.register(basicRoutes);
app.register(groupRoutes);
app.register(itemRoutes);
app.register(userRoutes);
  
export default app;