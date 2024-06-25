import { Prisma } from '@prisma/client';
import { CrudTypeMap } from 'src/utils/base/ICrudTypeMap';

export class CartProductTypeMap implements CrudTypeMap {
  aggregate: Prisma.CartProductAggregateArgs;
  count: Prisma.CartProductCountArgs;
  create: Prisma.CartProductCreateInput;
  createUnchecked: Prisma.CartProductUncheckedCreateInput;
  delete: Prisma.CartProductDeleteArgs;
  deleteMany: Prisma.CartProductDeleteManyArgs;
  findFirst: Prisma.CartProductFindFirstArgs;
  findMany: Prisma.CartProductFindManyArgs;
  findUnique: Prisma.CartProductFindUniqueArgs;
  update: Prisma.CartProductUpdateInput;
  updateMany: Prisma.CartProductUpdateManyArgs;
  upsert: Prisma.CartProductUpsertArgs;
  where: Prisma.CartProductWhereInput;
  select: Prisma.CartProductSelect;
  orderBy: Prisma.CartProductOrderByWithRelationInput;
}
