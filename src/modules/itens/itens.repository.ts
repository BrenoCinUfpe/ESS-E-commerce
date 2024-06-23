import { Injectable } from '@nestjs/common';
import { Prisma, RoleEnum, StatusEnum } from '@prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { DefaultFilter } from 'src/filters/DefaultFilter';
import { CrudType } from 'src/utils/base/ICrudTypeMap';
import { Paginated } from 'src/utils/base/IPaginated';
import { Paginator } from 'src/utils/paginator';

import { ProductCreateDto } from './dto/request/itens.create.dto';
import { TProductPagination } from './dto/type/itens.pagination';
import { ProductEntity } from './entity/itens.entity';
import { ProductTypeMap } from './entity/itens.type.map';

@Injectable()
export class ProductRepository {
  constructor(private readonly prisma: PrismaService) {}
  async create(data: Prisma.ProductCreateInput): Promise<ProductEntity> {
    return await this.prisma.product.create({
      data,
      include: {
        category: {
          include: {
            Media: true,
          },
        },
        productMedia: {
          include: {
            media: true,
          },
        },
      },
    });
  }

  async getById(id: number): Promise<ProductEntity> {
    return await this.prisma.product.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        category: {
          include: {
            Media: true,
          },
        },
        productMedia: {
          include: {
            media: true,
          },
        },
      },
    });
  }

  async update(
    id: number,
    data: Prisma.ProductUpdateInput,
  ): Promise<ProductEntity> {
    return await this.prisma.product.update({
      where: {
        id,
      },
      data,
      include: {
        category: {
          include: {
            Media: true,
          },
        },
        productMedia: {
          include: {
            media: true,
          },
        },
      },
    });
  }

  async delete(id: number): Promise<ProductEntity> {
    return await this.prisma.product.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
      include: {
        category: {
          include: {
            Media: true,
          },
        },
        productMedia: {
          include: {
            media: true,
          },
        },
      },
    });
  }
  async findFilteredAsync(
    filter: DefaultFilter<ProductTypeMap>,
  ): Promise<Paginated<TProductPagination>> {
    const AND: Record<string, any>[] = [
      {
        deletedAt: null,
      },
    ];

    if (filter.search) {
      filter.search = filter.search.trim();
      console.log(filter.search);
      AND.push({
        OR: [
          {
            name: {
              contains: filter.search,
              mode: 'insensitive',
            },
          },
        ],
      });
    }

    const prismaSelect: ProductTypeMap[CrudType.SELECT] = {
      id: true,
      createdAt: true,
      updatedAt: true,
      price: true,
      description: true,
      name: true,
      productMedia: {
        take: 1,
        select: {
          media: {
            select: {
              url: true,
            },
          },
        },
      },
    };

    return await Paginator.applyPagination(this.prisma.product, {
      ...filter,
      where: { AND },
      select: prismaSelect,
    });
  }
}
