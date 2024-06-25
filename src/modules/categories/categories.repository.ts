import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { CrudType } from 'src/utils/base/ICrudTypeMap';

import { CategoryEntity } from './entity/category.entity';
import { CategoryTypeMap } from './entity/category.type.map';

@Injectable()
export class CategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async exists(where: CategoryTypeMap[CrudType.WHERE]) {
    const categoriesCount = await this.prisma.category.count({
      where,
    });

    return categoriesCount > 0;
  }

  async create(
    data: CategoryTypeMap[CrudType.CREATE],
  ): Promise<CategoryEntity> {
    return this.prisma.category.create({
      data: {
        ...data,
      },
      include: {
        Media: true,
      },
    });
  }

  async getById(id: number): Promise<CategoryEntity> {
    return this.prisma.category.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        Media: true,
      },
    });
  }

  async getAll(): Promise<CategoryEntity[]> {
    return this.prisma.category.findMany({
      include: {
        Media: true,
      },
    });
  }

  async update(id: number, data: CategoryTypeMap[CrudType.UPDATE]) {
    return this.prisma.category.update({
      where: {
        id,
        deletedAt: null,
      },
      data,
    });
  }

  async delete(id: number) {
    return this.prisma.category.delete({
      where: {
        id,
      },
    });
  }
}
