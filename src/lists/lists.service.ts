import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateListInput } from './dto/create-list.input';
import { UpdateListInput } from './dto/update-list.input';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { List } from './entities/list.entity';
import { User } from '../users/entities/user.entity';
import { PaginationArgs, SearchArgs } from '../common/dto/args';

@Injectable()
export class ListsService{
  constructor(
    @InjectRepository(List)
    private readonly listRepository: Repository<List>
  ){}
  async create(createListInput: CreateListInput, user: User): Promise<List> {
    const list = await this.listRepository.create({...createListInput, user})
    return this.listRepository.save(list)
  }

  async findAll(user: User, {offset, limit}: PaginationArgs, {search}: SearchArgs): Promise<List[]> {
    const qb = await this.listRepository.createQueryBuilder('list')
    .leftJoinAndSelect('list.user', 'user')
    .where('list.userId = :id', {id: user.id})
    .offset(offset)
    .limit(limit);
    
    if(search){
      qb.andWhere('list.name ILIKE :name', { name: `%${search}%` })
    }

    return qb.getMany()
  }

  async findOne(id: string, user: User): Promise<List> {
    const qb = await this.listRepository.createQueryBuilder('list')
    .leftJoinAndSelect('list.user', 'user')
    .where('list.userId = :idUser', {idUser: user.id})
    .andWhere('list.id = :id', {id})
    .getOne();

    if(!qb){
      throw new NotFoundException(`the item with id: ${id} not found`)
    }
    return qb;
  }

  async update(updateListInput: UpdateListInput, user): Promise<List> {
    console.log(updateListInput);
    const listToUpdate = await this.listRepository.createQueryBuilder('list')
    .leftJoinAndSelect('list.user', 'user')
    .where('list.userId = :idUser', {idUser: user.id})
    .andWhere('list.id = :id', {id: updateListInput.id})
    .getOne();

    const updatedList = {
      ...listToUpdate,
      ...updateListInput
    }

    if(!listToUpdate){
      throw new NotFoundException(`the item with id: ${updateListInput.id} not found`)
    }

    return this.listRepository.save(updatedList)
  }

  async remove(id: string, user: User): Promise<List> {
    const listToRemove = await this.findOne(id, user)
    this.listRepository.remove(listToRemove)
    return {...listToRemove, id};
  }

  async listCountByUser(user: User): Promise<number>{
    return this.listRepository.count({
      where:{
        user: {
          id: user.id
        }
      }
    })
  }
}
