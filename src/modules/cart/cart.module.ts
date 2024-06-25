import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthRepository } from 'src/auth/auth.repository';
import { AuthService } from 'src/auth/auth.service';
import { PrismaModule } from 'src/database/prisma/prisma.module';

import { CartController } from './cart.controller';
import { CartRepository } from './cart.repository';
import { CartService } from './cart.service';

@Module({
  providers: [CartService, CartRepository, CartModule, CartController],
  controllers: [CartController],
  imports: [PrismaModule, JwtModule],
  exports: [CartService, CartRepository],
})
export class CartModule {}
