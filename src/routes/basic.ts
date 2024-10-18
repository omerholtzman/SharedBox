import { FastifyInstance } from 'fastify';
import { StatusCodes } from 'http-status-codes';

async function basicRoutes(app: FastifyInstance) {
  app.get('/health', async (req, reply) => {
    reply.status(StatusCodes.OK).send({ status: 'ok' });
  });
}

export default basicRoutes;