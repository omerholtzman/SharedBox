import { getDB } from "../index";
import type { Group } from "../../types/groups";

const insertGroup = async (groupData: Group) => {
    const db = getDB();
    return await db.collection('groups').insertOne({ ...groupData });
};

const findGroupByName = async (name: string) => {
    const db = getDB();
    return await db.collection('groups').findOne(
      { name },
      { projection: { _id: 0 } }
    );
  };
  
  const findAllGroups = async () => {
    const db = getDB();
    return await db.collection('groups').find({}, { projection: { _id: 0 } }).toArray();
  };
  
  const updateGroup = async (name: string, updateData: Partial<Group>) => {
    const db = getDB();
    const result = await db.collection('groups').findOneAndUpdate(
        { name },
        { $set: updateData },
        { returnDocument: 'after' }
      );
      
    if (result !== null) {
        const { _id, ...rest } = result; 
        return rest;
    }

    return result;
  };

const removeGroup = async (name: string) => {
    const db = getDB();
    return await db.collection('groups').deleteOne({ name });
};

export {insertGroup, findGroupByName, findAllGroups, updateGroup, removeGroup };