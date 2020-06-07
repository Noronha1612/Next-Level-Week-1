import { Router, response } from 'express';
import ItemsController from './controllers/ItemsController';
import PointsController from './controllers/PointsController';
import PointItemsController from './controllers/PointItemsController';

const routes = Router();

const Points = new PointsController();
const Items = new ItemsController();
const PointItems = new PointItemsController();

routes.get('/items', Items.index);
routes.get('/points', Points.index);
routes.get('/points/:id', Points.show)
routes.get('/pointItems', PointItems.index);

routes.post('/points', Points.create);

routes.delete('/points/:id', Points.delete);

export default routes;