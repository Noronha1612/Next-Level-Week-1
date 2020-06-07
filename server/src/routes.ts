import { Router, response } from 'express';
import ItemsController from './controllers/ItemsController';
import PointsController from './controllers/PointsController';
import PointItemsController from './controllers/PointItemsController';
import { celebrate, Joi } from 'celebrate';

import multer from 'multer';
import multerConfig from './config/multer';


const routes = Router();
const upload = multer(multerConfig);

const Points = new PointsController();
const Items = new ItemsController();
const PointItems = new PointItemsController();

routes.get('/items', Items.index);
routes.get('/points', Points.index);
routes.get('/points/:id', Points.show)
routes.get('/pointItems', PointItems.index);

routes.post(
  '/points', 
  upload.single('image'), 
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required(),
      email: Joi.string().required().email(),
      whatsapp: Joi.number().required(),
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
      city: Joi.string().required(),
      uf: Joi.string().required().max(2).min(2),
      items: Joi.string().required(),
    })
  }, {
    abortEarly: false,
  }), 
  Points.create
);

routes.delete('/points/:id', Points.delete);

export default routes;