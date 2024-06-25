import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class ReqCartProductDto {
  @ApiProperty({
    example: 'Cart ID',
    description: 'ID do Carrinho do Usuário',
  })
  cartId: string;

  @ApiProperty({
    example: 'Product ID',
    description: 'ID do Produto',
  })
  productId: string;

  @ApiProperty({
    example: 1,
    description: 'Quantidade de unidades desse item no carrinho',
  })
  quantity: number;
}
