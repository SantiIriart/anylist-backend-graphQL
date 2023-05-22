import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { UsersModule } from '../users/users.module';

import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';

import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports:[
    ConfigModule,
    PassportModule.register({defaultStrategy: 'jwt'}),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
          secret: configService.get('JWT_SECRET'),
          signOptions:{
            expiresIn: '4h'
          }
        })
    }),
    UsersModule,
  ],
  exports: [JwtStrategy, PassportModule, JwtModule],
  providers: [AuthResolver, AuthService, JwtStrategy],
})
export class AuthModule {}
