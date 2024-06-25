import { Prisma } from '@prisma/client';
import { CrudTypeMap } from 'src/utils/base/ICrudTypeMap';

export class CartTypeMap implements CrudTypeMap {
  aggregate: Prisma.CartAggregateArgs;
  count: Prisma.CartCountArgs;
  create: Prisma.CartCreateInput;
  createUnchecked: Prisma.CartUncheckedCreateInput;
  delete: Prisma.CartDeleteArgs;
  deleteMany: Prisma.CartDeleteManyArgs;
  findFirst: Prisma.CartFindFirstArgs;
  findMany: Prisma.CartFindManyArgs;
  findUnique: Prisma.CartFindUniqueArgs;
  update: Prisma.CartUpdateInput;
  updateMany: Prisma.CartUpdateManyArgs;
  upsert: Prisma.CartUpsertArgs;
  where: Prisma.CartWhereInput;
  select: Prisma.CartSelect;
  orderBy: Prisma.CartOrderByWithRelationInput;
}
