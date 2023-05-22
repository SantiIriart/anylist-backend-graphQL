import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { SignupInput, LoginInput } from './dto/inputs';
import { AuthResponse } from './types/auth-response.type';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { ValidRoles } from './enums/valid-roles.enum';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthResponse, {name: 'signup'})
  signup(
    @Args('signupInput') signupInput: SignupInput
  ): Promise<AuthResponse>{

    return this.authService.signup(signupInput)
  }

  @Mutation(() => AuthResponse , {name: 'login'})
  login(
    @Args('loginInput') logininput: LoginInput
  ): Promise<AuthResponse>{

    return this.authService.login(logininput)
  }

  @Query( () => AuthResponse, {name: 'revalidate'})
  @UseGuards(JwtAuthGuard)
  revalidateToken(
    @CurrentUser([ValidRoles.admin]) user: User,
  ): AuthResponse{
    return this.authService.revalidateToken(user)
  }

}
