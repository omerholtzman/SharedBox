import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { findUserByUsername, createUser } from '../db/repositories/users';
import config from '../../config';

export const signUp = async (username: string, password: string):
 Promise<boolean> => {
  const existingUser = await findUserByUsername(username);
  if (existingUser) {
    return false;
  }
  return await createUser(username, password);
};

export const signIn = async (username: string, password: string):
 Promise<string | null> => {
  const user = await findUserByUsername(username);
  if (!user) return null;

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) return null;

  return jwt.sign({ username }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRE_TIME });
};
