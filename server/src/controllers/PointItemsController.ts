import { Request, Response} from 'express';
import knex from '../database/connection';

class PointItemsController {
    async index (req: Request, res: Response) {
        const data = await knex('point_items').select('*');

        return res.json(data);
    }
}

export default PointItemsController;
