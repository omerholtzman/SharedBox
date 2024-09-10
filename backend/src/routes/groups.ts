import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { handleError } from '../utils/errorHandler';
import { groupSchema, updateGroupSchema } from '../schemas/groups';

const groups: Array<{ 
  name: string;
  description?: string;
  password: string }> = [];

async function getGroups(req: FastifyRequest, reply: FastifyReply) {
  try {
    reply.status(200).send(groups);
  } catch (error) {
    handleError(reply, error);
  }
}

async function createGroup(req: FastifyRequest, reply: FastifyReply) {
  try {
    const newGroup = groupSchema.parse(req.body);
    const existingGroup = groups.find(group => group.name === newGroup.name);
    if (existingGroup) {
      return reply.status(400).send({ message: 'Group with this name already exists' });
    }
    groups.push(newGroup);
    reply.status(201).send(newGroup);
  } catch (error) {
    handleError(reply, error);
  }
}

async function updateGroup(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { name } = req.params as { name: string };
    const groupIndex = groups.findIndex((group) => group.name === name);
    if (groupIndex === -1) {
      return reply.status(404).send({ message: 'Group not found' });
    }

    const updateData = updateGroupSchema.parse(req.body);
    groups[groupIndex] = { ...groups[groupIndex], ...updateData };
    reply.status(200).send(groups[groupIndex]);
  } catch (error) {
    handleError(reply, error);
  }
}

async function deleteGroup(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { name } = req.params as { name: string };
    const groupIndex = groups.findIndex((group) => group.name === name);
    if (groupIndex === -1) {
      return reply.status(404).send({ message: 'Group not found' });
    }

    groups.splice(groupIndex, 1);
    reply.status(204).send();
  } catch (error) {
    handleError(reply, error);
  }
}

async function groupRoutes(app: FastifyInstance) {
  app.get('/groups', getGroups);
  app.post('/groups', createGroup);
  app.patch('/groups/:name', updateGroup);
  app.delete('/groups/:name', deleteGroup);
}

export default groupRoutes;
