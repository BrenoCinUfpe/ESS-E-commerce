import { Injectable, BadRequestException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';

import { PrismaService } from '../../database/prisma/prisma.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async createOrder(orderData: any) {
    const { userId, code, price, estimatedDelivery } = orderData;

    const order = await this.prisma.order.create({
      data: {
        userId: userId,
        code: code,
        price: price,
        estimatedDelivery: estimatedDelivery,
        status: 'PROCESSING',
      },
    });

    const emailMarkup = `<h1>Eba! Seu pedido foi confirmado. Agradecemos a preferência pelo seu pedido!</h1>
                         <p>Seu pedido com código ${order.code} foi recebido e está sendo processado.</p>`;
    await this.emailService.sendEmail(
      emailMarkup,
      'Confirmação de Pedido',
      orderData.email,
    );

    return order;
  }

  async cancelOrder(id: number) {
    if (!id) {
      throw new BadRequestException('Id não enviado');
    }

    await this.prisma.order.update({
      where: {
        id,
      },
      data: {
        status: OrderStatus.CANCELED,
      },
    });

    return id;
  }
}
