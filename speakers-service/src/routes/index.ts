import express, { NextFunction, Request, Response } from "express";
import SpeakersServices from "../logic";
import { Config } from "../utils/config";

const router = express();

const createSpeakersRoute = (config: Config) => {
  const speakersServices = new SpeakersServices(config.data.speakers);

  router.use('/images', express.static(config.data.images));

  router.get('/speaker/:shortname', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const speaker = await speakersServices.getSpeaker(req.params.shortname)
      res.json(speaker);
    } catch(err){
      return next(err);
    }
  });

  router.get('/list', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await speakersServices.getList();
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  });

  router.get('/list-short', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await speakersServices.getListShort();
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  });

  router.get('/names', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await speakersServices.getNames();
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  });

  router.get('/artworks', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await speakersServices.getAllArtworks();
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  });

  router.get('/artwork/:shortname', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await speakersServices.getArtworkForSpeaker(req.params.shortname);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  });

  router.use((error: any, req: Request, res: Response, next: NextFunction) => {
    res.status(error.status || 500);
    console.error(error);
    res.json({
      error: {
        message: error.message,
      },
    });
    return;
  });

  return router;
};


export default createSpeakersRoute;
