import { ObjectType, Field, Int, ID, Float } from '@nestjs/graphql';
import { Column, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { IsOptional } from 'class-validator';

import { ListItem } from '../../list-item/entities/list-item.entity';
import { User } from '../../users/entities/user.entity';

@Entity({name: 'items'})
@ObjectType()
export class Item {
  
  @PrimaryGeneratedColumn('uuid')
  @Field( () => ID)
  id: string;

  @Column()
  @Field(() => String)
  name: string;

  @Column({nullable: true})
  @Field(() => String, {nullable: true})
  @IsOptional()
  quantityUnits?: string;
  //stores
  @ManyToOne( () => User, (user) => user.list, {nullable: false})
  @Index()
  @Field(() => User)
  user: User

  @OneToMany(() => ListItem, (listItem) => listItem.item, {lazy: true})
  @Field(() => [ListItem])
  listItem: ListItem[]


}
