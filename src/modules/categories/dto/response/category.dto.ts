import { AutoMap } from '@automapper/classes';
import { ApiResponseProperty } from '@nestjs/swagger';
import { MediaEntity } from 'src/modules/user/entity/media.entity';

export class MediaResponseDto {
  @AutoMap()
  @ApiResponseProperty({
    type: String,
  })
  id: string;

  @AutoMap()
  @ApiResponseProperty({
    type: String,
  })
  url: string;
}

export class CategoryResponseDto {
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
    type: String,
  })
  createdAt: Date | string;

  @AutoMap()
  @ApiResponseProperty({
    type: String,
  })
  updatedAt: Date;

  @AutoMap()
  @ApiResponseProperty({
    type: String,
  })
  status: string;

  @AutoMap()
  @ApiResponseProperty({
    type: String,
  })
  mediaId: string;

  @AutoMap()
  @ApiResponseProperty({
    type: MediaResponseDto,
  })
  media: MediaResponseDto;
}
