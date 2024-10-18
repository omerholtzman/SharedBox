import Fastify from 'fastify';
import basicRoutes from './routes/basic';
import groupRoutes from './routes/groups';
import authRoutes from './routes/auth';
import itemRoutes from './routes/items';

import { verifyToken } from './middleware/authMiddleware';

const app = Fastify({ logger: true });

app.addHook('preHandler', (req, reply, done) => {
    const publicRoutes = ['/signup', '/signin', '/signout'];
    if (publicRoutes.includes(req.routeOptions.url!)) {
      return done();
    }
    return verifyToken(req, reply, done);
});

app.register(authRoutes);
app.register(basicRoutes);
app.register(groupRoutes);
app.register(itemRoutes);
  
export default app;