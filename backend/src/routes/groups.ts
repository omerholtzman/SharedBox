import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { groupSchema, updateGroupSchema } from '../schemas/groups';
import { StatusCodes } from 'http-status-codes';
import { handleError } from '../utils/errorHandler';

import { 
  findAllGroups,
  findGroupByName,
  insertGroup,
  removeGroup, 
  updateGroup } from '../db/repositories/groups';

async function getGroups(req: FastifyRequest, reply: FastifyReply) {
  try {
    const groups = await findAllGroups();
    reply.status(StatusCodes.OK).send(groups);
  } catch (error) {
    handleError(reply, error);
  }
}

async function createGroup(req: FastifyRequest, reply: FastifyReply) {
  try {
    const newGroup = groupSchema.parse(req.body);
    const existingGroup = await findGroupByName(newGroup.name);
    if (existingGroup) {
      return reply.status(StatusCodes.BAD_REQUEST)
      .send({ message: 'Group with this name already exists' });
    }
    await insertGroup(newGroup);
    reply.status(StatusCodes.CREATED).send(newGroup);
  } catch (error) {
    handleError(reply, error);
  }
}

async function patchGroup(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { name } = req.params as { name: string };
    const updateData = updateGroupSchema.parse(req.body);
    const result = await updateGroup(name, updateData);
    if (!result) {
      return reply.status(StatusCodes.NOT_FOUND).send({ message: 'Group not found' });
    }
    reply.status(StatusCodes.OK).send(result);
  } catch (error) {
    handleError(reply, error);
  }
}

async function deleteGroup(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { name } = req.params as { name: string };
    const result = await removeGroup(name);
    if (result.deletedCount === 0) {
      return reply.status(StatusCodes.NOT_FOUND).send({ message: 'Group not found' });
    }
    reply.status(StatusCodes.NO_CONTENT).send();
  } catch (error) {
    handleError(reply, error);
  }
}

async function groupRoutes(app: FastifyInstance) {
  app.get('/groups', getGroups);
  app.post('/groups', createGroup);
  app.patch('/groups/:name', patchGroup);
  app.delete('/groups/:name', deleteGroup);
}

export default groupRoutes;
