import { getDB } from "../index";
import type { Group } from "../../types/groups";

export const insertGroup = async (groupData: Group) => {
    const db = getDB();
    return await db.collection('groups').insertOne({ ...groupData });
};

export const findGroupByName = async (name: string) => {
    const db = getDB();
    return await db.collection('groups').findOne(
      { name },
      { projection: { _id: 0 } }
    );
  };
  
  export const findAllGroups = async () => {
    const db = getDB();
    return await db.collection('groups').find({}, { projection: { _id: 0 } }).toArray();
  };
  
  export const updateGroup = async (name: string, updateData: Partial<Group>) => {
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

export const removeGroup = async (name: string) => {
    const db = getDB();
    return await db.collection('groups').deleteOne({ name });
};
