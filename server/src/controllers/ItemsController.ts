import {Request,Response} from 'express';
import knex from '../database/connection';

const ItemsController = {
  async index(req:Request, res:Response){
    const items = await knex.select('*').from('items');

    const serializerItems = items.map(item => {
      return {
        id:item.id,
        image:item.image,
        title:item.title,
        url:`http://192.168.0.102:3333/uploads/${item.image}`
      }
    });

    res.json({serializerItems});
  }

}

export default ItemsController;
