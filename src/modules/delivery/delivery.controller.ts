import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CorreiosService } from './delivery.service';

@Controller('correios')
@ApiBearerAuth()
@ApiTags('Correios')
export class CorreiosController {
  constructor(private readonly correiosService: CorreiosService) {}

  @Get('tempo-entrega/:cepDestino')
  async calcularTempoEntrega(
    @Param('cepDestino') cepDestino: string,
  ): Promise<{ tempoEntrega: number }> {
    const tempoEntrega =
      await this.correiosService.calculateDeliveryTime(cepDestino);
    return { tempoEntrega };
  }
}
