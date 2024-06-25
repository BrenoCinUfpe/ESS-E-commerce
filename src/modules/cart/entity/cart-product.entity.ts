import { ApiProperty } from '@nestjs/swagger';
import { CartProduct } from '@prisma/client';

export class CartProductEntity implements CartProduct {
  @ApiProperty({
    type: Number,
    description: 'Cart ID',
    example: 1,
  })
  cartId: number;

  @ApiProperty({
    type: Number,
    description: 'Product ID',
    example: 123,
  })
  productId: number;

  @ApiProperty({
    type: Number,
    description: 'Quantity/units of certain item in the cart',
    example: false,
  })
  quantity: number;

  @ApiProperty({
    type: Number,
    description: 'User ID (Payload verifying porpuses)',
    example: 123,
  })
  userId: number;
}
