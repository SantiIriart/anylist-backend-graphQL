import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { SeedService } from './seed.service';
import { Seed } from './entities/seed.entity';
import { CreateSeedInput } from './dto/create-seed.input';
import { UpdateSeedInput } from './dto/update-seed.input';

@Resolver(() => Seed)
export class SeedResolver {
  constructor(
    private readonly seedService: SeedService,
    ) {}

  @Mutation(() => Boolean, {name: 'executeSeed', description:'Ejecuta la constucción de la semilla de datos'})
  executeSeed(): Promise<boolean> {
    return this.seedService.executeSeed();
  }
}
