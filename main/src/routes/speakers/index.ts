import express, { NextFunction, Request, Response } from 'express';
import SpeakersServices from '../../services/speakers-service';

const router = express.Router();

export const createSpeakerRoute = (speakersServices: SpeakersServices) => {
  router.get('/', async (req: Request, res: Response) => {
    try {
      const promises = [speakersServices.getList(), speakersServices.getAllArtworks];
      const results = await Promise.all(promises);
      res.render('speakers', {
        page: 'All Speakers',
        speakerslist: results[0],
        artwork: results[1],
      });
    } catch (error) {
      return error;
    }
  });

  router.get('/:name', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const promises = [];
      promises.push(speakersServices.getSpeaker(req.params.name));
      promises.push(speakersServices.getArtworkForSpeaker(req.params.name));
      const results = await Promise.all(promises);

      if (!results[0]) {
        return next();
      }

      res.render('speakers/detail', {
        page: req.params.name,
        speaker: results[0],
        artwork: results[1],
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
};