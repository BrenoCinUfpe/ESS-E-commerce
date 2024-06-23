import { AutoMap } from '@automapper/classes';
import {
  ApiResponseProperty,
  ApiPropertyOptional,
  ApiProperty,
} from '@nestjs/swagger';
import { RoleEnum, StatusEnum } from '@prisma/client';

export class ProductPaginationResponse {
  @ApiResponseProperty({
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @AutoMap()
  id: string;

  @ApiResponseProperty({
    example: '03/11/2024',
  })
  @AutoMap()
  createdAt: Date | any;

  @ApiResponseProperty({
    example: '2021-01-01T00:00:00.000Z',
  })
  @AutoMap()
  updatedAt: Date;

  @ApiResponseProperty({
    example: 'Descrição do produto',
  })
  @AutoMap()
  description: string;

  @ApiResponseProperty({
    example: 'Nome do produto',
  })
  @AutoMap()
  name: string;

  @ApiResponseProperty({
    example: 4.0,
  })
  price: number;

  @ApiResponseProperty({
    example: 'www.abc.com.br/image.jpg',
  })
  @AutoMap()
  imageUrl: string;
}
