import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Item } from '../../items/entities/item.entity';
import { List } from '../../lists/entities/list.entity';

@Entity()
@Unique('listItem-item', ['list', 'item'])
@ObjectType()
export class ListItem {

@PrimaryGeneratedColumn('uuid')
@Field(() => ID)
  id: string;

  @Column()
  @Field(() => Number)
  quantity: number;


  @Column()
  @Field(() => Boolean)
  completed: boolean;


  //! Relations

  @ManyToOne(() => List, (list) => list.listItem, {lazy: true})
  @Field(() => Item)
  list: List;

  @ManyToOne(() => Item, (item) => item.listItem,{lazy:true})
  @Field(() => Item)
  item: Item;
}
