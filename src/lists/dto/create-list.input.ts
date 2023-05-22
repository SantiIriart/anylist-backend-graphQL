import { InputType, Int, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

@InputType()
export class CreateListInput {
  @Field( () => String)
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  name: string;
}
