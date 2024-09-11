import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { signUp, signIn } from '../auth/authService';
import { signInSchema, signUpSchema } from '../schemas/users';

async function signUpHandler(req: FastifyRequest, reply: FastifyReply) {
  const { username, password } = signUpSchema.parse(req.body);
  const signedUpSuccess = await signUp(username, password);
  if (!signedUpSuccess) {
    return reply.status(StatusCodes.BAD_REQUEST).send({ message: 'User already exists' });
  }
  reply.status(StatusCodes.CREATED).send({ message: 'User created' });
}

async function signInHandler(req: FastifyRequest, reply: FastifyReply) {
  const { username, password } = signInSchema.parse(req.body);
  const token = await signIn(username, password);
  if (!token) {
    return reply.status(StatusCodes.UNAUTHORIZED)
        .send({ message: 'Invalid credentials' });
  }
  reply.status(StatusCodes.OK).send({ token });
}

async function signOutHandler(req: FastifyRequest, reply: FastifyReply) {
  reply.status(StatusCodes.OK).send({ message: 'Logged out' });
}

export default async function authRoutes(app: FastifyInstance) {
  app.post('/signup', signUpHandler);
  app.post('/signin', signInHandler);
  app.post('/signout', signOutHandler);
}
