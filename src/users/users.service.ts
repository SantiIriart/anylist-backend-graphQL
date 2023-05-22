import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './entities/user.entity';
import { SignupInput } from 'src/auth/dto/inputs/signup.input';
import { NotFoundError } from 'rxjs';
import { ValidRoles } from '../auth/enums/valid-roles.enum';
import { PaginationArgs, SearchArgs } from 'src/common/dto/args';

@Injectable()
export class UsersService {
  private logger: Logger = new Logger('UsersService')
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ){}
  async create(signUpInput: SignupInput): Promise<User> {
    try {
      const newUser = this.userRepository.create({
        ...signUpInput,
        password: bcrypt.hashSync(signUpInput.password, 10)
      });
      return await this.userRepository.save(newUser);
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async findAll(roles: ValidRoles[], {limit, offset}: PaginationArgs, {search}: SearchArgs):Promise<User[]> {
    if(!roles.length){
      roles = [ValidRoles.admin, ValidRoles.user, ValidRoles.superUser]
    }

    const qb = await this.userRepository.createQueryBuilder('user')
      .where('ARRAY[roles] && ARRAY[:...roles]')
      .andWhere('user.isActive = true')
      .setParameter('roles', roles)
      .limit(limit)
      .offset(offset);

    if(search){
      qb.andWhere('user.fullName ILIKE :name', {name: `%${search}%`});
    }
    
    return qb.getMany();
  }

  // 8d76c69b-270b-4172-a253-d68d4ee3fbea

  async findOneByEmail(email: string): Promise<User> {
    try{
      return await this.userRepository.findOneByOrFail({email})
    }catch(error){
      this.handleDBErrors( {
        code: 'error-001',
        detail: `Wrong credentials`
      } )
    }
  }

  async findOneById(id: string): Promise<User> {
    try{
      return await this.userRepository.findOneByOrFail({id})
    }catch(error){
      throw new NotFoundException(`${id} not found`)
    }
  }

  async update(updateUserInput: UpdateUserInput, updateBy: User): Promise<User> {
    try {
      let updatedUser = await this.userRepository.preload({
        ...updateUserInput,
        });
      if(updateUserInput.password){
        updatedUser = await this.userRepository.preload({
          ...updateUserInput,
          password: bcrypt.hashSync(updateUserInput.password, 10)
        });
      }
      updatedUser.lastUpdateBy = updateBy;
      if(!updatedUser){
        throw new NotFoundException(`the user with id: ${updateUserInput.id} not found`)
      }
      return await this.userRepository.save(updatedUser);
    } catch (error) {
      this.handleDBErrors(error)
    }
  }

  async block(id: string, adminUser: User): Promise<User> {
    const userToBlock = await this.findOneById(id)
    userToBlock.isActive = false;
    userToBlock.lastUpdateBy = adminUser;
    console.log(userToBlock)
    return await this.userRepository.save(userToBlock)
  }

  private handleDBErrors( error: any): never{
    if(error.code === '23505'){
      throw new BadRequestException(error.detail.replace('Key ',''));
    }
    if(error.code === 'error-001'){
      throw new BadRequestException(error.detail.replace('Key ',''));
    }
    this.logger.error(error)
    throw new InternalServerErrorException(`Please check server logs`)
  }
}
