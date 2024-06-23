import { ApiProperty } from '@nestjs/swagger';
import { Media, ProductMedia } from '@prisma/client';
import { MediaEntity } from 'src/modules/user/entity/media.entity';

export class ProductMediaEntity implements ProductMedia {
  id: number;
  productId: number;
  mediaId: number;
  media: MediaEntity;
}
