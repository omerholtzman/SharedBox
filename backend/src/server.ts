import Fastify from 'fastify';
import basicRoutes from './routes/basic';
import groupRoutes from './routes/groups';

const app = Fastify({ logger: true });

app.register(basicRoutes);
app.register(groupRoutes);
  
export default app;