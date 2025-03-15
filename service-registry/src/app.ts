import express, { Request, Response } from 'express';
import config from './utils/config';
import createRegistryRoute from './routes/index';

const app = express();
const routes = createRegistryRoute(config);

app.use(express.json());
app.use('/', routes, (req: Request, res:Response) => {
  console.log(req.params);
});

app.listen(config.port, () => {
  config.log.info(`Listening on port: ${config.port} in ${app.get('env')} mode.`);
});

export default app;