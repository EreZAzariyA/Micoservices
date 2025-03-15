import express, { NextFunction, Request, Response } from 'express';
import path from 'path';
import config, { ENV_TYPE } from './utils/config';
import bodyParser from 'body-parser';
import createError from 'http-errors';
import SpeakersServices from './services/speakers-service';
import createRoutes from './routes';
import { AxiosError } from 'axios';
import FeedbackServices from './services/feedback-services';

const app = express();
const speakers = new SpeakersServices(config);
const feedbacks = new FeedbackServices(config);
app.set('view engine', 'pug');

if (process.env.NODE_ENV === 'development') {
  app.locals.pretty = true;
};
app.set('views', path.join(__dirname, ('./views')));
app.locals.title = config.sitename;

app.use(express.static(path.join(__dirname, ('./public'))));
app.use(bodyParser.urlencoded({ extended: true }));
app.get('/favicon.ico', (_, res: Response) => {
  res.sendStatus(204);
});

app.use(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const names = await speakers.getNames();
    res.locals.speakerNames = names;
    return next();
  } catch (error) {
    next(error);
  }
});

app.use('/', createRoutes(
  speakers,
  feedbacks
));

app.use((error: any, req: Request, res: Response, next: NextFunction) => next(createError(404, error || 'Error')));

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.log({ errorMessage: error.message });

  res.locals.message = error.message;
  const status = error.status || 500;
  res.locals.status = status;
  res.locals.error = req.app.get('env') === ENV_TYPE.DEVELOPMENT ? error : {};
  res.status(status);
  return res.render('error');
});

app.listen(3080, () => {
  console.log('running on port 3080');
});
