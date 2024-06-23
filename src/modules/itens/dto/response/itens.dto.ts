import { AutoMap } from '@automapper/classes';
import { ApiResponseProperty } from '@nestjs/swagger';

export class ProductResponseDto {
  @AutoMap()
  @ApiResponseProperty({
    type: String,
  })
  id: string;

  @AutoMap()
  @ApiResponseProperty({
    type: String,
  })
  name: string;

  @AutoMap()
  @ApiResponseProperty({
    type: Number,
  })
  price: number;

  @AutoMap()
  @ApiResponseProperty({
    type: String,
  })
  description: string;

  @AutoMap()
  @ApiResponseProperty({
    type: String,
  })
  imageUrl: string;
}
