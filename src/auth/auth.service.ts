import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/entities/user.entity';
import { AuthResponse } from './types/auth-response.type';
import { UsersService } from 'src/users/users.service';
import { SignupInput, LoginInput } from './dto/inputs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ){}

  async signup(signupInput: SignupInput): Promise<AuthResponse>{
    const user = await this.usersService.create(signupInput)
    return{
      token: this.getJwtToken(user.id),
      user
    }
  }

  async login({email, password}: LoginInput): Promise<AuthResponse>{
    const user = await this.usersService.findOneByEmail(email);
    if(!bcrypt.compareSync(password, user.password)){
      throw new BadRequestException('Wrong credentials')
    }
    return{
      token: this.getJwtToken(user.id),
      user
    }
  }
  
  async validateUser(id: string): Promise<User>{
    const user = await this.usersService.findOneById(id)
    if(!user.isActive){
      throw new UnauthorizedException(`User inactive`);
    }
    delete user.password;
    return user;

  }

  revalidateToken(user: User): AuthResponse {
    const token = this.getJwtToken(user.id)
    return{
      token,
      user
    }
  }

  private getJwtToken(userId: string){
    return this.jwtService.sign({id: userId})
  }
}
