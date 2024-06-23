import { AutoMap } from '@automapper/classes';
import { StatusEnum } from '@prisma/client';

import { ProductMediaEntity } from '../../entity/media.entity';

export class TProductPagination {
  @AutoMap()
  id: string;

  @AutoMap()
  createdAt: Date | any;

  @AutoMap()
  updatedAt: Date;

  @AutoMap()
  deletedAt: Date;

  @AutoMap()
  name: string;

  @AutoMap()
  price: number;

  @AutoMap()
  description: string;

  productMedia: ProductMediaEntity[];
}
