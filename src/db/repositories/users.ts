import { getDB } from '../index';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';

export interface User {
  _id?: ObjectId;
  username: string;
  passwordHash: string;
}

export const findUserByUsername = async (username: string): Promise<User | null> => {
  const db = getDB();
  return await db.collection<User>('users').findOne({ username });
};

export const createUser = async (username: string, password: string):
  Promise<boolean> => {
  const db = getDB();
  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = { username, passwordHash };
  const result = await db.collection('users').insertOne(newUser);
  return result.acknowledged;
};
