import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { CategoryEntity } from 'src/modules/categories/entity/category.entity';

export class ProductCreateDto {
  @ApiProperty({
    example: 'Produto A',
    description: 'Nome do item',
  })
  @IsNotEmpty({ message: 'O campo de nome deve ser preenchido' })
  @IsString({ message: 'O campo de nome deve ser uma string' })
  @MaxLength(200, {
    message: 'O campo de nome deve ter menos de 200 caracteres',
  })
  @Transform(({ value }: TransformFnParams) =>
    typeof value === 'string' ? value.trim() : value,
  )
  name: string;

  @ApiProperty({
    example: 'Descrição do Produto A',
    description: 'Descrição do item',
  })
  @IsNotEmpty({ message: 'O campo de descrição deve ser preenchido' })
  @IsString({ message: 'O campo de descrição deve ser uma string' })
  @MaxLength(500, {
    message: 'O campo de descrição deve ter menos de 500 caracteres',
  })
  @Transform(({ value }: TransformFnParams) =>
    typeof value === 'string' ? value.trim() : value,
  )
  description: string;

  @ApiProperty({
    example: 19.99,
    description: 'Preço do item',
  })
  @IsNotEmpty({ message: 'O campo de preço deve ser preenchido' })
  @IsNumber({}, { message: 'O campo de preço deve ser um número' })
  price: number;

  @ApiPropertyOptional({
    example: 'https://cdn.example.com/itemA.png',
    description: 'URL da imagem do item',
  })
  @IsOptional()
  @IsString({ message: 'O campo de imagem deve ser uma string' })
  @MaxLength(200, {
    message: 'O campo de imagem deve ter menos de 200 caracteres',
  })
  @Transform(({ value }: TransformFnParams) =>
    typeof value === 'string' ? value.trim() : value,
  )
  imageUrl?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID da categoria do item',
  })
  @IsOptional()
  @IsNumber({}, { message: 'O campo de ID da categoria deve ser um número' })
  categoryId?: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'Quantidade em estoque do item',
  })
  @IsOptional()
  @IsNumber({}, { message: 'O campo de estoque deve ser um número' })
  stock?: number;
}
