import { InputType, Field, ID } from '@nestjs/graphql';
import { IsBoolean, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

@InputType()
export class CreateListItemInput {
  
  @Field(() => Number, {nullable:true})
  @IsOptional()
  @Min(0)
  @IsNumber()
  quantity: number = 0;

  @Field(() => Boolean, {nullable:true})
  @IsBoolean()
  @IsOptional()
  completed: boolean = false;

  @Field(() => ID)
  @IsUUID()
  listId: string;


  @Field(() => ID)
  @IsUUID()
  itemId: string;



}
