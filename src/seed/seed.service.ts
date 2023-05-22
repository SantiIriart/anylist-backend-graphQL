import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateSeedInput } from './dto/create-seed.input';
import { UpdateSeedInput } from './dto/update-seed.input';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from 'src/items/entities/item.entity';
import { SEED_ITEMS, SEED_USERS } from './data/seed-data';
import { UsersService } from 'src/users/users.service';
import { ItemsService } from 'src/items/items.service';
import { ListItem } from 'src/list-item/entities/list-item.entity';
import { List } from 'src/lists/entities/list.entity';

@Injectable()
export class SeedService {

  private isProd: boolean;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    @InjectRepository(ListItem)
    private readonly listItemRepository: Repository<ListItem>,
    @InjectRepository(List)
    private readonly listRepository: Repository<List>,

    private readonly configService: ConfigService,
    private readonly userService: UsersService,
    private readonly itemService: ItemsService,
  ){
    this.isProd = configService.get('STATE') === 'prod'
  }
  async executeSeed(): Promise<boolean> {
    if(this.isProd){
      throw new UnauthorizedException('Can not execute the seed in production')
    }
    await this.deleteDatabase();
    const user = await this.loadUsers()
    await this.loadItems(user)
    return true;
  }

  async deleteDatabase(){
    await this.listItemRepository.createQueryBuilder()
    .delete()
    .where({})
    .execute();
    await this.listRepository.createQueryBuilder()
    .delete()
    .where({})
    .execute();
    await this.itemRepository.createQueryBuilder()
    .delete()
    .where({})
    .execute();

    await this.userRepository.createQueryBuilder()
    .delete()
    .where({})
    .execute();
  }

  async loadUsers(){
    const users = [];
    for(const user of SEED_USERS){
      users.push(await this.userService.create(user));
    }
    return users[0];
  }

  async loadItems(user: User){
    const items = [];
    for(const item of SEED_ITEMS){
      items.push(this.itemService.create(item, user));
    }
    await Promise.all(items)
  }
}
