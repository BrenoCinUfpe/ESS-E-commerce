import { Controller, Get, HttpStatus, Res, HttpCode } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { IsPublic } from 'src/auth/decorators/is-public.decorator';

@Controller('health')
@ApiTags('Health Check')
export class HealthCheckController {
  @ApiOperation({ summary: 'Check Server Health' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Server is running',
  })
  @HttpCode(HttpStatus.OK)
  @IsPublic()
  @Get()
  async health(@Res() res: Response): Promise<Response> {
    return res.status(HttpStatus.OK).json({
      status: 'Running',
    });
  }
}