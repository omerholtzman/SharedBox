import { getDB } from "../index";
import type { Group, NewGroup } from "../../types/groups";
import type { UpdateOperations } from "../../types/utils";

const createNewGroup = async (newGroupData: NewGroup) => {
    const db = getDB();
    const { opener, ...rest } = newGroupData;
    const newGroup = { ...rest, members: [opener] };
    const insertionResult = await db.collection<Group>('groups')
      .insertOne(newGroup);
    return { ...newGroup, _id: insertionResult.insertedId };
};

const findGroupByName = async (name: string): Promise<Group | null> => {
    const db = getDB();
    return await db.collection<Group>('groups').findOne(
      { name },
      { projection: { _id: 0 } }
    );
  };
  
const findAllGroups = async (): Promise<Array<Group> | null> => {
  const db = getDB();
  return await db.collection<Group>('groups')
    .find({}, { projection: { _id: 0 } }).toArray();
};

const updateGroup = async (name: string, operations: UpdateOperations<Group>): 
Promise<Group | null> => {
  const db = getDB();
  const result = await db.collection<Group>('groups').findOneAndUpdate(
      { name },
      operations,
      { returnDocument: 'after',
        projection: { _id: 0 }}
    );

  return result;
};

const removeGroup = async (name: string) => {
    const db = getDB();
    return await db.collection<Group>('groups').deleteOne({ name });
};

export {createNewGroup, findGroupByName, findAllGroups, updateGroup, removeGroup };