
import { WithId } from 'mongodb';
import { getDB } from '..';
import { GroupItem, Item } from '../../types/items';

const findItemsByGroup = async (group: string): 
Promise<Array<GroupItem> | null> => {
  const db = getDB();
  const items: Array<GroupItem> = await db.collection<Item>('items').find({ group }, 
    {projection: {name: true, count: true, _id: false}}).toArray(); 
  return items;
};

const insertNewItem = async (groupName: string, newItem: GroupItem): 
    Promise<boolean> => {
    const db = getDB(); 

    const existingItem = await db.collection('items')
        .findOne({ group: groupName, name: newItem.name });
    if (existingItem) return false;

    const result = await db.collection('items')
        .insertOne({ ...newItem, group: groupName });
    if (result.acknowledged) return true;
    
    return false;
};

const updateItem = async (filter: Partial<Item>, set: Partial<Item>):
Promise<WithId<Item> | null> => {
    const db = getDB();

    const result = await db.collection<Item>('items').findOneAndUpdate(
        filter, { $set: set }, { returnDocument: 'after' }
    );

    return result;
};

const deleteItem = async (filter: Partial<Item>): Promise<boolean> => {
    const db = getDB();
  
    const result = await db.collection<Item>('items').deleteOne(filter);
  
    return result.deletedCount !== 0;
};

export { insertNewItem, findItemsByGroup, updateItem, deleteItem };