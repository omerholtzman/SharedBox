import { FastifyReply, FastifyRequest } from 'fastify';
import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import config from '../../config';

export const verifyToken = (req: FastifyRequest, reply: FastifyReply, done: any) => {
  const token = req.headers.authorization?.split(' ')[1]; // Expecting 'Bearer <token>'
  if (!token) {
    return reply.status(StatusCodes.FORBIDDEN).send({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    (req as any).user = decoded;
    done();
  } catch (error) {
    reply.status(StatusCodes.UNAUTHORIZED).send({ message: 'Invalid token' });
  }
};
