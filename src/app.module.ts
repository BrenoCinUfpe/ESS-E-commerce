import { classes } from '@automapper/classes';
import {
  CamelCaseNamingConvention,
  SnakeCaseNamingConvention,
} from '@automapper/core';
import { AutomapperModule } from '@automapper/nestjs';
import { HttpModule } from '@nestjs/axios';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { SoapModule } from 'nestjs-soap';

import { AuthModule } from './auth/auth.module';
import { AtGuard } from './auth/guards';
import { RolesGuard } from './auth/guards/roles.guard';
import { PrismaModule } from './database/prisma/prisma.module';
import { AllExceptionsFilter } from './middlewares/exception.filter';
import { CategoriesModule } from './modules/categories/categories.module';
import { DeliveryModule } from './modules/delivery/delivery.module';
import { EmailModule } from './modules/email/email.module';
import { OrdersModule } from './modules/orders/orders.module';
import { UserModule } from './modules/user/user.module';
import { CartModule } from './modules/cart/cart.module';


@Module({
  providers: [
    { provide: APP_GUARD, useClass: AtGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
  imports: [
    EmailModule,
    ConfigModule.forRoot(),
    AutomapperModule.forRoot({
      strategyInitializer: classes(),
      namingConventions: {
        source: new CamelCaseNamingConvention(),
        destination: new SnakeCaseNamingConvention(),
      },
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
    HttpModule,
    SoapModule.register({
      clientName: 'SOAP_CORREIOS',
      uri: process.env.API_CORREIOS_URL,
    }),
    AuthModule,
    PrismaModule,
    UserModule,
    EmailModule,
    CategoriesModule,
    OrdersModule,
    DeliveryModule,
    CartModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {}
}
