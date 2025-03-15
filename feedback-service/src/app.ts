import express, { Request, Response } from 'express';
import config from './utils/config';
import axios from 'axios';
import createFeedbackRoute from './services';

const app = express();
const log = config.log;
const routes = createFeedbackRoute(config);

app.use(express.json());
app.use('/', routes);

app.use("*", (_, res: Response) => {
  res.status(404).send('Route Not Found');
});

const server = app.listen(0, () => {
  const port = (server.address() as any).port;
  const registerService = () => axios.put(`http://localhost:5001/register/${config.name}/${config.version}/${port}`);
  const unregisterService = () => axios.delete(`http://localhost:5001/unregister/${config.name}/${config.version}/${port}`);

  registerService();

  const interval = setInterval(registerService, 15 * 1000);
  const cleanup = async () => {
    clearInterval(interval);
    await unregisterService();
  }

  process.on('uncaughtException', async() => {
    await cleanup();
    process.exit(0);
  });

  process.on('SIGINT', async() => {
    await cleanup();
    process.exit(0);
  });

  process.on('SIGTERM', async() => {
    await cleanup();
    process.exit(0);
  });

  // setTimeout(() => {
  //   console.log('err');
    
  //   throw new Error('Something happened');
  // }, 5000)

  log.info(`Listening on port: ${port} in ${app.get('env')} mode.`);
});

export default app;