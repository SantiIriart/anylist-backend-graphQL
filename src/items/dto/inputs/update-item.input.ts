import { InputType, Field, Int, PartialType, Float, ID } from '@nestjs/graphql';
import { IsOptional, IsUUID } from 'class-validator';
import { CreateItemInput } from './create-item.input';

@InputType()
export class UpdateItemInput extends PartialType(CreateItemInput) {
  @Field(() => ID)
  @IsUUID()
  id: string;
}
