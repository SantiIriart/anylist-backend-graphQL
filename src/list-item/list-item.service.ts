import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { List } from '../lists/entities/list.entity';
import { ListItem } from './entities/list-item.entity';

import { CreateListItemInput } from './dto/create-list-item.input';
import { UpdateListItemInput } from './dto/update-list-item.input';
import { PaginationArgs, SearchArgs } from '../common/dto/args';
import { User } from 'src/users/entities/user.entity';
import { query } from 'express';

@Injectable()
export class ListItemService {
  constructor(
    @InjectRepository(ListItem)
    private readonly listItemsRepository: Repository<ListItem>
  ){}

  async create(createListItemInput: CreateListItemInput) {
    const {itemId, listId, ...rest} = createListItemInput;
    const newListItem = await this.listItemsRepository.create({
      ...rest,
      item: {id: itemId},
      list: {id: listId}
    })
    return this.listItemsRepository.save(newListItem)
  }

  async findAll({id}: List, {limit, offset}: PaginationArgs, {search}: SearchArgs) {

    const qb = await this.listItemsRepository.createQueryBuilder('listItem')
    .innerJoin('listItem.item', 'item')
    .where('listItem.listId = :listId', { listId: id })
    .offset(offset)
    .limit(limit);
    
    if(search){
      qb.andWhere('list.name ILIKE :name', { name: `%${search}%` })
    }

    return qb.getMany();
  }

  async findOne(id: string): Promise<ListItem> {
    const listItem = await this.listItemsRepository.findOneBy({id})
    if(!listItem){
      throw new BadRequestException(`the listItem with id: ${id} not found`)
    }
    return listItem;

  }

  async update( {id, listId, itemId, ...rest}: UpdateListItemInput): Promise<ListItem> {
    const qb = await this.listItemsRepository.createQueryBuilder('listItem')
    .update()
    .set(rest)
    .where('id = :id', {id})

    if(listId) qb.set({list: {id: listId}});
    if(itemId) qb.set({item: {id: itemId}})

    await qb.execute()

    return this.findOne(id)
  }

  remove(id: number) {
    return `This action removes a #${id} listItem`;
  }

  async countTotalItemsByList(list: List): Promise<number>{
    return this.listItemsRepository.count({
      where:{
        list:{
          id: list.id
        }
      }
    })
  }
}
