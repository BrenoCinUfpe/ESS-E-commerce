import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CategoryCreateDto {
  @ApiProperty({
    example: 'Tênis',
    description: 'Nome da categoria',
  })
  @IsNotEmpty({ message: 'O campo de nome deve ser preenchido' })
  @IsString({ message: 'O campo de nome deve ser uma string' })
  @MaxLength(200, {
    message: 'O campo de nome deve ter menos de 200 caracteres',
  })
  @Transform(
    ({ value }: TransformFnParams) =>
      typeof value === 'string' && value?.trim(),
  )
  name: string;

  @ApiPropertyOptional({
    example: 'https://cdn-icons-png.flaticon.com/512/2589/2589903.png',
    description: 'URL da imagem da categoria',
  })
  @IsOptional()
  @IsString({ message: 'O campo de imagem deve ser uma string' })
  @MaxLength(200, {
    message: 'O campo de imagem deve ter menos de 200 caracteres',
  })
  @Transform(
    ({ value }: TransformFnParams) =>
      typeof value === 'string' && value?.trim(),
  )
  imageUrl: string;
}
