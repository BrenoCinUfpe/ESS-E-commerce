import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class ReqCartDto {
  @ApiProperty({
    example: 'Cart ID',
    description: 'ID do Carrinho do Usuário',
  })
  id: string;

  @ApiProperty({
    example: 'User ID',
    description: 'ID do Usuário',
  })
  userId: string;

  @ApiProperty({
    example: 'Cart Status',
    description: 'Status do Carrinho (Bloqueado ou não)',
  })
  locked: boolean;

  @ApiProperty({
    example: [],
    description: 'Array de Produtos no Carrinho',
  })
  products: [];
}
