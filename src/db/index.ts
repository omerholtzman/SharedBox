import { MongoClient, Db } from 'mongodb';
import config from '../../config';

const state = {
  client: null as MongoClient | null,
  db: null as Db | null,
};

const buildIndexes = async (db: Db) => {
  await db.collection('groups').createIndex({ name: 1 }, { unique: true });
  await db.collection('users').createIndex({ username: 1 }, { unique: true });
  await db.collection('items').createIndex({ group: 1 });
};


export const connectDB = async () => {
  try {
    if (state.client && state.db) {
      console.log('MongoDB connection already established');
      return state.db;
    }

    const client = new MongoClient(config.MONGO_URI);

    await client.connect()
      .then(() => console.log('Connected to MongoDB'))
      .catch((err) => {
      console.error('Failed to connect to MongoDB. Retrying...', err);
      setTimeout(async () => await client.connect(), 1000);
    });;

    const db = client.db(config.DB_NAME);
    
    state.client = client;
    state.db = db;

    console.log(`MongoDB connected to database: ${config.DB_NAME}`);

    await buildIndexes(db);

    return db;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw new Error('MongoDB connection failed');
  }
};

export const getDB = (): Db => {
  if (!state.db) {
    throw new Error('Database not connected');
  }
  return state.db;
};

export const disconnectDB = async () => {
  if (state.client) {
    await state.client.close();
    state.client = null;
    state.db = null;
    console.log('MongoDB connection closed');
  }
};
