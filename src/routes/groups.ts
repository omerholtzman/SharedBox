import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { 
  newGroupSchema,
  subscribeUserSchema,
  unsubscribeUserSchema,
  updateGroupSchema
} from '../schemas/groups';

import { 
  findAllGroups,
  findGroupByName,
  createNewGroup,
  removeGroup, 
  updateGroup, 
} from '../db/repositories/groups';

async function getGroups(req: FastifyRequest, reply: FastifyReply) {
  const groups = await findAllGroups();
  reply.status(StatusCodes.OK).send(groups);
}

async function createGroup(req: FastifyRequest, reply: FastifyReply) {
    const newGroupData = newGroupSchema.parse(req.body);
    const existingGroup = await findGroupByName(newGroupData.name);
    if (existingGroup) {
      return reply.status(StatusCodes.BAD_REQUEST)
      .send({ message: 'Group with this name already exists' });
    }

    const newGroup = await createNewGroup(newGroupData);
    if (!newGroup._id) reply.status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message:'Failed to create the group' });

    reply.status(StatusCodes.CREATED).send(newGroup);
}

async function patchGroup(req: FastifyRequest, reply: FastifyReply) {
  const { name } = req.params as { name: string };
  const updateData = updateGroupSchema.parse(req.body);
  const result = await updateGroup(name, { $set: updateData });
  if (!result) {
    return reply.status(StatusCodes.NOT_FOUND).send({ message: 'Group not found' });
  }
  reply.status(StatusCodes.OK).send(result); 
}

async function deleteGroup(req: FastifyRequest, reply: FastifyReply) {
  const { name } = req.params as { name: string };
  const result = await removeGroup(name);
  if (result.deletedCount === 0) {
    return reply.status(StatusCodes.NOT_FOUND).send({ message: 'Group not found' });
  }
  reply.status(StatusCodes.NO_CONTENT).send();
}

async function subscribeUser(req: FastifyRequest, reply: FastifyReply) {
  const { name } = req.params as { name: string };
  const { username, password } = subscribeUserSchema.parse(req.body);

  const group = await findGroupByName(name);
  if (!group) {
    return reply.status(StatusCodes.NOT_FOUND).send({ message: 'Group not found' });
  }

  if (group.password !== password) {
    return reply.status(StatusCodes.UNAUTHORIZED)
    .send({ message: 'Incorrect password' });
  }

  if (group.members.includes(username)) {
    return reply.status(StatusCodes.BAD_REQUEST)
    .send({ message: 'User already subscribed' });
  }

  await updateGroup(name, { $push: { members: username } });

  reply.status(StatusCodes.OK).send({ message: 'Subscribed successfully' });
}

async function unsubscribeUser(req: FastifyRequest, reply: FastifyReply) {
  const { name } = req.params as { name: string };
  const { username } = unsubscribeUserSchema.parse(req.body);

  const group = await findGroupByName(name);
  
  if (!group) {
    return reply.status(StatusCodes.NOT_FOUND).send({ message: 'Group not found' });
  }

  if (!group.members.includes(username)) {
    return reply.status(StatusCodes.NOT_FOUND).send({ message: 'User not subscribed' });
  }

  await updateGroup(name, { $pull: { members: username } });

  reply.status(StatusCodes.OK).send({ message: 'Unsubscribed successfully' });
}

async function groupRoutes(app: FastifyInstance) {
  app.get('/groups', getGroups);
  app.post('/groups', createGroup);
  app.patch('/groups/:name', patchGroup);
  app.delete('/groups/:name', deleteGroup);
  app.post('/groups/:name/subscribe', subscribeUser);
  app.post('/groups/:name/unsubscribe', unsubscribeUser);
}

export default groupRoutes;
