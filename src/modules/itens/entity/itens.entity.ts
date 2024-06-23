import { ApiProperty } from '@nestjs/swagger';
import { Product } from '@prisma/client';
import { CategoryEntity } from 'src/modules/categories/entity/category.entity';
import { ProductMediaEntity } from 'src/modules/itens/entity/media.entity';

export class ProductEntity implements Product {
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  @ApiProperty({
    type: Number,
    description: 'The unique identifier for the product',
    example: 1,
  })
  id: number;

  @ApiProperty({
    type: String,
    description: 'The name of the product',
    example: 'Running Shoes',
  })
  name: string;

  @ApiProperty({
    type: Number,
    description: 'The price of the product',
    example: 49.99,
  })
  price: number;

  @ApiProperty({
    type: Number,
    description: 'The stock quantity of the product',
    example: 100,
  })
  stock: number;

  @ApiProperty({
    type: CategoryEntity,
    description: 'The category of the product',
    example: {
      id: 1,
      name: 'Shoes',
      Media: { id: 1, url: 'https://example.com/media/image.jpg' },
    },
  })
  category: CategoryEntity;

  @ApiProperty({
    type: Number,
    example: 1,
    description: 'ID of the category of the product',
  })
  categoryId: number;

  @ApiProperty({
    type: String,
    description: 'The description of the product',
    example: 'High-performance running shoes for athletes.',
  })
  description: string;

  @ApiProperty({
    type: [ProductMediaEntity],
    description: 'Media associated with the product',
    example: [{ id: 1, url: 'https://example.com/media/image.jpg' }],
  })
  productMedia: ProductMediaEntity[];
}
