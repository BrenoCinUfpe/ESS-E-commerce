import {
  createMap,
  forMember,
  extend,
  mapFrom,
  Mapper,
} from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { format } from 'date-fns';

import { ProductPaginationResponse } from './dto/response/itens.pagination.response';
import { TProductPagination } from './dto/type/itens.pagination';

@Injectable()
export class ProductMapping extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(
        mapper,
        TProductPagination,
        ProductPaginationResponse,
        forMember(
          destination => destination.imageUrl,
          mapFrom(source => source?.productMedia[0]?.media?.url),
        ),
      );
    };
  }
}
