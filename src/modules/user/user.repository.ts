import { Injectable } from '@nestjs/common';
import { RoleEnum, StatusEnum } from '@prisma/client';
import { User } from '@prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { DefaultFilter } from 'src/filters/DefaultFilter';
import { CrudType } from 'src/utils/base/ICrudTypeMap';
import { Paginated } from 'src/utils/base/IPaginated';
import { Paginator } from 'src/utils/paginator';

import { TUserPagination } from './dto/type/user.pagination';
import { UserEntity } from './entity/user.entity';
import { UserTypeMap } from './entity/user.type.map';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findFilteredAsync(
    filter: DefaultFilter<UserTypeMap>,
  ): Promise<Paginated<TUserPagination>> {
    const AND: Record<string, any>[] = [
      {
        status: {
          not: StatusEnum.INACTIVE,
        },
        deletedAt: null,
        role: RoleEnum.CUSTOMER,
      },
    ];

    if (filter.search) {
      filter.search = filter.search.trim();

      AND.push({
        OR: [
          {
            name: {
              contains: filter.search,
              mode: 'insensitive',
            },
          },
          {
            email: {
              contains: filter.search,
              mode: 'insensitive',
            },
          },
        ],
      });
    }

    const prismaSelect: UserTypeMap[CrudType.SELECT] = {
      id: true,
      createdAt: true,
      updatedAt: true,
      status: true,
      email: true,
      name: true,
      role: true,
    };

    return await Paginator.applyPagination(this.prisma.user, {
      ...filter,
      where: { AND: filter.query },
      select: prismaSelect,
    });
  }

  async updateAsync(
    id: number,
    data: UserTypeMap[CrudType.UPDATE],
  ): Promise<User> {
    return await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        ...data,
      },
    });
  }

  async findBy(
    where: UserTypeMap[CrudType.WHERE],
    select: UserTypeMap[CrudType.SELECT],
    orderBy?: UserTypeMap[CrudType.ORDER_BY],
  ) {
    return await this.prisma.user.findFirst({
      where,
      select,
      orderBy,
    });
  }

  async findByIdAsync(id: number): Promise<UserEntity> {
    return await this.prisma.user.findUnique({
      where: {
        id,
        deletedAt: null,
        status: {
          not: StatusEnum.INACTIVE,
        },
      },
      include: {
        Media: true,
      },
    });
  }

  async deleteAsync(id: number): Promise<void> {
    await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        status: StatusEnum.INACTIVE,
        deletedAt: new Date(),
      },
    });
  }

  async createAsync(data: UserTypeMap[CrudType.CREATE]): Promise<UserEntity> {
    return await this.prisma.user.create({
      data: {
        ...data,
        status: StatusEnum.ACTIVE,
      },
      include: {
        Media: true,
      },
    });
  }

  async exists(where: UserTypeMap[CrudType.WHERE]) {
    const user = await this.prisma.user.count({
      where,
    });

    return user > 0;
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email?.trim()?.toLowerCase() },
      include: {
        Media: true,
      },
    });

    return user;
  }

  async updateUserPassword(id: number, password: string): Promise<void> {
    await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        password,
        recoveryPasswordToken: null,
      },
    });
  }

  async getOrders(userId: number) {
    const orders = await this.prisma.order.findMany({
      where: { userId: userId },
    });
    return orders;
  }
}
