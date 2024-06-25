import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Category } from '@prisma/client';
import { MediaEntity } from 'src/modules/user/entity/media.entity';

export class CategoryEntity implements Category {
  @ApiProperty({
    type: Number,
    description: 'The unique identifier for the category',
    example: 123,
  })
  id: number;

  @ApiProperty({
    type: String,
    description: 'The name of the category',
    example: 'Tênis',
  })
  name: string;

  @ApiPropertyOptional({
    type: Date,
    description: 'The delete date of the category',
    example: '2021-01-01T00:00:00.000Z',
  })
  deletedAt: Date | null;

  @ApiProperty({
    type: Date,
    description: 'The created date of the category',
    example: '2021-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiPropertyOptional({
    type: Date,
    description: 'The updated date of the category',
    example: '2021-01-01T00:00:00.000Z',
  })
  updatedAt: Date | null;

  @ApiPropertyOptional({ type: MediaEntity })
  Media: MediaEntity | null;

  @ApiPropertyOptional({
    type: Number,
    description: 'The unique identifier for the media',
    example: 123,
  })
  mediaId: number | null;
}
