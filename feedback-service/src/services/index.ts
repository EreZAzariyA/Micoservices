import { AxiosError } from "axios";
import FeedbackServices from "../logic";
import { Config, ENV_TYPE } from "../utils/config";
import amqplib from 'amqplib';
import express, { NextFunction, Request, Response } from 'express';

const service = express();

const createFeedbackRoute = (config: Config) => {
  const feedbackServices = new FeedbackServices(config.data.feedbacks);
  const q = 'feedback';

  amqplib.connect('amqp://localhost')
    .then((conn) => conn.createChannel())
    .then((ch) => (
      ch.assertQueue(q)
        .then(() => (
          ch.consume(q, (msg) => {
            if (msg !== null) {
              config.log.debug(`Got message ${msg.content.toString()}`);
              const qm = JSON.parse(msg.content.toString());
              feedbackServices.addEntry(qm.name, qm.title, qm.message)
                .then(() => ch.ack(msg));
            }
          })
        ))
    )).catch((error) => config.log.fatal({ error }));

  if (service.get('env') === ENV_TYPE.DEVELOPMENT) {
    service.use((req: Request, res: Response, next: NextFunction) => {
      config.log.debug(`${req.method}:${req.url}`);
      return next();
    });
  }

  service.get('/list', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const list = await feedbackServices.getList();
      res.status(200).json(list);
    } catch (error) {
      next(error);
    }
  });

  service.use((err: AxiosError, req: Request, res: Response, next: NextFunction) => {
    res.status(err.status || 500);
    config.log.error({err: err.message});
    res.json({
      error: {
        message: err.message,
      }
    });
  });

  return service;
};

export default createFeedbackRoute;