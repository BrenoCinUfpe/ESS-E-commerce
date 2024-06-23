import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DefaultFilter } from 'src/filters/DefaultFilter';
import { Paginated } from 'src/utils/base/IPaginated';
import { MessagesHelperKey, getMessage } from 'src/utils/messages.helper';
import { handleError } from 'src/utils/treat.exceptions';

import { ProductCreateDto } from './dto/request/itens.create.dto';
import { ProductUpdateDto } from './dto/request/itens.update.dto';
import { ProductPaginationResponse } from './dto/response/itens.pagination.response';
import { TProductPagination } from './dto/type/itens.pagination';
import { ProductEntity } from './entity/itens.entity';
import { ProductTypeMap } from './entity/itens.type.map';
import { ProductRepository } from './itens.repository';

@Injectable()
export class ProductService {
  private logger = new Logger(ProductService.name);

  constructor(
    private readonly productRepository: ProductRepository,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  async createItem(data: ProductCreateDto): Promise<ProductEntity> {
    try {
      if (data.price < 0)
        throw new BadRequestException(
          getMessage(MessagesHelperKey.PRICE_LESS_THAN_ZERO),
        );
      if (data.stock < 0)
        throw new BadRequestException(
          getMessage(MessagesHelperKey.STOCK_LESS_THAN_ZERO),
        );
      const productData: Prisma.ProductCreateInput = {
        name: data.name,
        description: data.description,
        price: data.price,
        stock: data.stock || 0,
        productMedia: {
          create: [
            {
              media: {
                create: { url: data.imageUrl },
              },
            },
          ],
        },
        category: {
          connect: { id: data.categoryId },
        },
      };
      const createdItem = await this.productRepository.create(productData);
      return createdItem;
    } catch (error) {
      handleError(error);
    }
  }

  async getItemById(id: number): Promise<ProductEntity> {
    try {
      const item = await this.productRepository.getById(id);
      if (!item) {
        throw new NotFoundException(
          getMessage(MessagesHelperKey.ITEM_NOT_FOUND),
        );
      }
      return item;
    } catch (error) {
      handleError(error);
    }
  }

  async updateItem(id: number, data: ProductUpdateDto): Promise<ProductEntity> {
    try {
      const dataPrisma: Prisma.ProductUpdateInput = {};
      if (data.name) dataPrisma.name = data.name;
      if (data.description) dataPrisma.description = data.description;
      if (data.price) {
        if (data.price < 0)
          throw new BadRequestException(
            getMessage(MessagesHelperKey.PRICE_LESS_THAN_ZERO),
          );
        dataPrisma.price = data.price;
      }
      if (data.stock) {
        if (data.stock < 0)
          throw new BadRequestException(
            getMessage(MessagesHelperKey.STOCK_LESS_THAN_ZERO),
          );
        dataPrisma.stock = data.stock;
      }
      if (data.categoryId) {
        dataPrisma.category = {
          connect: { id: data.categoryId },
        };
      }
      if (data.imageUrl) {
        dataPrisma.productMedia = {
          create: [
            {
              media: {
                create: { url: data.imageUrl },
              },
            },
          ],
        };
      }

      const updatedItem = await this.productRepository.update(id, dataPrisma);
      return updatedItem;
    } catch (error) {
      handleError(error);
    }
  }

  async findFilteredAsync(
    filter: DefaultFilter<ProductTypeMap>,
  ): Promise<Paginated<Partial<ProductPaginationResponse>>> {
    try {
      this.logger.log(`Find filtered async`);

      const productFiltered =
        await this.productRepository.findFilteredAsync(filter);

      const productFilteredDataMapped = this.mapper.mapArray(
        productFiltered.data,
        TProductPagination,
        ProductPaginationResponse,
      );

      return {
        ...productFiltered,
        data: productFilteredDataMapped,
      };
    } catch (error) {
      handleError(error);
    }
  }

  async deleteItem(id: number): Promise<void> {
    try {
      await this.productRepository.delete(id);
    } catch (error) {
      handleError(error);
    }
  }
}
