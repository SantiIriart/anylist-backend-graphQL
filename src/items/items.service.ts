import { Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Item } from './entities/item.entity';
import { User } from '../users/entities/user.entity';

import { CreateItemInput } from './dto/inputs/create-item.input';
import { UpdateItemInput } from './dto/inputs/update-item.input';
import { PaginationArgs, SearchArgs } from '../common/dto/args/index';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>
  ){}
  async create(createItemInput: CreateItemInput, user: User): Promise<Item> {
    const newItem = this.itemsRepository.create({...createItemInput, user})
    return this.itemsRepository.save(newItem)
  }

  async findAll({ id }: User, {offset, limit}: PaginationArgs, {search}: SearchArgs) {
    const qb = await this.itemsRepository.createQueryBuilder('item')
    .leftJoinAndSelect('item.user', 'user')
    .where('item.userId = :id', { id })
    .offset(offset)
    .limit(limit);
    
    if(search){
      qb.andWhere('item.name ILIKE :name', { name: `%${search}%` })
    }
    return qb.getMany();;

  }

  async findOne(id: string, idUser: User): Promise<Item> {
    const item = await this.itemsRepository.createQueryBuilder('item')
    .leftJoinAndSelect('item.user', 'user')
    .where('item.user.id = :idUser', {idUser: idUser.id})
    .andWhere('item.id = :id', {id})
    .getOne();
    if(!item){
      throw new NotFoundException(`the item with id: ${id} not found`)
    }
    return item;
  }

  async update(updateItemInput: UpdateItemInput, user :User): Promise<Item> {
    //? I like this way, because it only do one query to the database instead of two.
    const item = await this.itemsRepository.createQueryBuilder('item')
    .leftJoinAndSelect('item.user', 'user')
    .where('item.user.id = :idUser', {idUser: user.id})
    .andWhere('item.id = :id', {id: updateItemInput.id})
    .getOne();

    const itemUpdated: Item = {
      ...item,
      ...updateItemInput
    }

    if(!item){
      throw new NotFoundException(`the item with id: ${updateItemInput.id} not found`)
    }

    return this.itemsRepository.save(itemUpdated)
  }

  async remove(id: string, user: User): Promise<Item> {
    const item = await this.findOne(id, user)
    this.itemsRepository.remove(item)
    return {id, ...item};

  }

  async itemCountByUser({id}: User): Promise<number>{
    const count = await this.itemsRepository.count({
      where:{
          user:{
          id
        }
      }
    })
    return(count)
}
}
