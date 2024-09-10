import app from './server';
import config from '../config';

app.listen({ port: config.PORT }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server running at ${address}`);
});