import { FastifyReply } from 'fastify';
import { StatusCodes } from 'http-status-codes';


export function handleError(reply: FastifyReply, error) {
  if (error.validation) {
    reply.status(StatusCodes.BAD_REQUEST)
      .send({ message: 'Validation Error', details: error.validation });
  } else {
    reply.status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: 'Internal Server Error', details: error.message });
  }
}
