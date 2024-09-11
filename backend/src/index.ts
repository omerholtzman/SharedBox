import app from './server';
import config from '../config';

import { connectDB, disconnectDB } from './db/index';

const startServer = async () => {
  try {
    const address = await app.listen({ port: config.PORT });
    console.log(`Server running at ${address}`);
  } catch (error) {
    console.error('Error starting the server:', error);
    process.exit(1);
  }
};

const startApplication = async () => {
  try {
    await connectDB();

    await startServer();

    handleShutdown();
  } catch (error) {
    console.error('Error during application startup:', error);
    process.exit(1);
  }
};

const handleShutdown = () => {
  process.on('SIGINT', async () => {
    console.log('SIGINT received. Shutting down gracefully...');
    await disconnectDB();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    await disconnectDB();
    process.exit(0);
  });
};

startApplication();
