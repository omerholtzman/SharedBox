import Fastify from 'fastify';
import basicRoutes from './routes/basic';

const app = Fastify({ logger: true });

app.register(basicRoutes);

export default app;