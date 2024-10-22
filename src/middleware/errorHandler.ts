import { FastifyReply } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { ZodError } from 'zod';


export function handleError(reply: FastifyReply, error: any) {
  if (error instanceof ZodError) {
    reply.status(StatusCodes.BAD_REQUEST)
      .send({ message: 'Validation Error', details: error });
  } else {
    reply.status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: 'Internal Server Error', details: error.message });
  }
}
