import { FastifyReply } from 'fastify';

export function handleError(reply: FastifyReply, error) {
  if (error.validation) {
    reply.status(400).send({ message: 'Validation Error', details: error.validation });
  } else {
    reply.status(500).send({ message: 'Internal Server Error', details: error.message });
  }
}
