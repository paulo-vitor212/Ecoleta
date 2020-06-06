import {Request,Response} from 'express';
import knex from '../database/connection';

const PointsController = {
  async show(req: Request, res: Response){
    const {id} = req.params;
    const point = await knex('points').where('id',id).first();

    if(!point){
      return res.status(400).json({message: "Not Found"});
    }

    const items = await knex('items')
    .join('point_items','items.id','=','point_items.item_id')
    .where('point_items.point_id',id)
    .select('title');

    return res.status(200).json({point,items});
  },

  async index(req: Request, res: Response){
    const {cidade, uf, items} = req.query;
    
    const id_items = String(items)
    .split(',')
    .map(
      item => Number(item.trim())
    );

    const point = await knex('points')
    .join('point_items','points.id','point_items.point_id')
    .whereIn('item_id',id_items)
    .where('cidade',String(cidade))
    .where('uf',String(uf))
    .distinct()
    .select('points.*');

    if(!point[0]){
      return res.status(400).json({message:"Point Not Found"})
    }


    res.status(200).json({point})
  },

  async allPoints(req: Request, res: Response){
    const {cidade, uf, items} = req.query;
    
    const id_items = String(items)
    .split(',')
    .map(
      item => Number(item.trim())
    );

    const point = await knex('points').select('points.*');

    if(!point[0]){
      return res.status(400).json({message:"Point Not Found"})
    }

    res.status(200).json({point})
  },

  async create(req:Request, res:Response){
    const {
      name,
      email,
      telefone,
      latitude,
      longitude,
      cidade,
      uf,
      items
     } = req.body;

    const trx = await knex.transaction();

    const insert_point_id = await trx('points').insert({
      image:
        // 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=480&q=60',
        'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=480&q=60',
      name,
      email,
      telefone,
      latitude,
      longitude,
      cidade,
      uf
    });

    //getting recently point registered
    const point_id = insert_point_id[0];

    const points_items = items.map((item_id: number)=> {
      return{
        point_id,
        item_id
      }
    });
    

    const insert_point_items_id = await trx('point_items').insert(points_items);

    if(insert_point_id[0] && insert_point_items_id){
      trx.commit(); //commit after transaction is ok
    }

    res.json({
      point_id: insert_point_id[0]
    });
  },


  async destroy (req:Request, res:Response){
    const {id} = req.params;
    const point = await knex('points').where('id',id).first();

    if(!point){
      return res.status(400).json({message:"Point Not Found"});
    }

    const result = await await knex('points').where('id',id).first().del()
    
    return res.status(200).json({message:"Pointo de coleta deletado com sucesso", status: result});
  }

}

export default PointsController;
