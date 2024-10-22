import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { StatusCodes } from 'http-status-codes';

import { 
  findUserGroups, 
} from '../db/repositories/groups';

async function getUserGroups(req: FastifyRequest, reply: FastifyReply) {
    const { username } = req.params as { username: string };
  
    const groups = await findUserGroups(username);
  
    if (!groups || groups.length === 0) {
      return reply.status(StatusCodes.NOT_FOUND)
        .send({ message: 'No groups found for the user' });
    }
    
    const groupsNames = groups.map((group) => (group.name));
    reply.status(StatusCodes.OK).send({ groups: groupsNames });
  }

async function userRoutes(app: FastifyInstance) {
    app.get('/users/:username/groups', getUserGroups);
}

export default userRoutes;