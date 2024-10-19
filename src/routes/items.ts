import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { newItemSchema, renameItemSchema, updateItemCountSchema } from '../schemas/items';
import { deleteItem, findItemsByGroup, insertNewItem, updateItem }
 from '../db/repositories/items';

async function getItems(req: FastifyRequest, reply: FastifyReply) {
  const { groupName } = req.params as { groupName: string };
  const items = await findItemsByGroup(groupName);
  reply.status(StatusCodes.OK).send(items);
}

async function addItem(req: FastifyRequest, reply: FastifyReply) {
    const { groupName } = req.params as { groupName: string };
    const newItem = newItemSchema.parse(req.body);
    
    const insertionResult = await insertNewItem(groupName, newItem);
    
    if (!insertionResult) {
      return reply.status(StatusCodes.BAD_REQUEST)
        .send({ message: 'Item already exists' });
    }
    
    reply.status(StatusCodes.CREATED).send({ message: 'Item added successfully' });
}  

async function updateItemCount(req: FastifyRequest, reply: FastifyReply) {
    const { groupName, itemName } = req.params as { groupName: string; itemName: string };
    const { count } = updateItemCountSchema.parse(req.body);
  
    const result = await updateItem({ group: groupName, name: itemName }, { count });
  
    if (!result) {
      return reply.status(StatusCodes.NOT_FOUND).send({ message: 'Item not found' });
    }
  
    reply.status(StatusCodes.OK).send({ message: 'Item updated successfully' });
}  

async function renameItem(req: FastifyRequest, reply: FastifyReply) {
    const { groupName, itemName } = req.params as { groupName: string; itemName: string };
    const { newName } = renameItemSchema.parse(req.body);
  
    const result = await updateItem(
        { group: groupName, name: itemName }, { name: newName });
  
    if (!result) {
      return reply.status(StatusCodes.NOT_FOUND).send({ message: 'Item not found' });
    }
  
    reply.status(StatusCodes.OK).send({ message: 'Item renamed successfully' });
}

async function removeItem(req: FastifyRequest, reply: FastifyReply) {
    const { groupName, itemName } = req.params as { groupName: string; itemName: string };
    const deleteResult = await deleteItem({ group: groupName, name: itemName });

    if (!deleteResult) {
      return reply.status(StatusCodes.NOT_FOUND).send({ message: 'Item not found' });
    }
  
    reply.status(StatusCodes.NO_CONTENT).send();
  }  

async function itemRoutes(app: FastifyInstance) {
  app.get('/groups/:groupName/items', getItems);
  app.post('/groups/:groupName/items', addItem);
  app.patch('/groups/:groupName/items/:itemName', updateItemCount);
  app.put('/groups/:groupName/items/:itemName', renameItem);
  app.delete('/groups/:groupName/items/:itemName', removeItem);
}

export default itemRoutes;