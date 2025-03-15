import express, { NextFunction, Request, Response } from 'express';
import FeedbackServices from '../../services/feedback-services';

const router = express.Router();

export const createFeedbackRoute = (feedbacksServices: FeedbackServices) => {
  router.get('/', async (req: Request, res: Response) => {
    try {
      const feedbacklist = await feedbacksServices.getList();
      res.render('feedback', {
        page: 'Feedback',
        feedbacklist,
        success: req.query.success,
      });
    } catch (error) {
      return error;
    }
  });

  router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { fbName: name, fbTitle: title, fbMessage: message } = req.body;
      
      const fbName = name.trim();
      const fbTitle = title.trim();
      const fbMessage = message.trim();
      const feedbackList = await feedbacksServices.getList();
      if (!(fbName || fbTitle || fbMessage)) {
        return res.render('feedback', {
          page: 'Feedback',
          error: true,
          fbName,
          fbTitle,
          fbMessage,
          feedbacklist: feedbackList
        });
      }
      await feedbacksServices.addEntry(fbName, fbTitle, fbMessage);
      return res.redirect('/feedback?success=true');
    } catch (error) {
      return next(error);
    }
  });

  return router;
};