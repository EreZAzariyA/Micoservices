import express, { Request, Response, NextFunction } from 'express';
import SpeakersServices from '../services/speakers-service';
import { createSpeakerRoute } from '../routes/speakers';
import { createFeedbackRoute } from './feedbacks';
import FeedbackServices from '../services/feedback-services';

const router = express.Router();

const createRoutes = (speakersServices?: SpeakersServices, feedbacksServices?: FeedbackServices) => {
  router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const promises = [speakersServices.getListShort(), speakersServices.getAllArtworks()];
      const results = await Promise.all(promises);

      res.render('index', {
        page: 'Home',
        speakerslist: results[0],
        artwork: results[1],
      });
    } catch (error) {
      next(error);
    }
  });

  router.get('/images/:type/:file', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const image = await speakersServices.getImage(`${req.params.type}/${req.params.file}`);
      return image.pipe(res);
    } catch (err) {
      next(err);
    }
  });

  router.use('/speakers', createSpeakerRoute(speakersServices));
  router.use('/feedback', createFeedbackRoute(feedbacksServices));

  return router;
};


export default createRoutes;