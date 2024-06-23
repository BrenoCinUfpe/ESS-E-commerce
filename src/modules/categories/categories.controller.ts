import { Controller } from '@nestjs/common';
import { Body, Post, Get, Res, Param, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RoleEnum } from '@prisma/client';
import { Response } from 'express';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ApiExceptionResponse } from 'src/utils/swagger-schemas/SwaggerSchema';

import { CategoriesService } from './categories.service';
import { CategoryCreateDto } from './dto/request/category.create.dto';
import { CategoryResponseDto } from './dto/response/category.dto';

@ApiBearerAuth()
@Controller('categories')
@ApiTags('Categories')
export class CategoriesController {
  constructor(protected readonly service: CategoriesService) {}

  @ApiOperation({ summary: 'Create category' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: CategoryResponseDto,
  })
  @ApiExceptionResponse()
  @Post()
  @Roles(RoleEnum.ADMIN)
  async create(@Res() response: Response, @Body() body: CategoryCreateDto) {
    const category = await this.service.createCategory(body);

    return response.status(HttpStatus.CREATED).json(category);
  }

  @ApiOperation({ summary: 'Get category by ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: CategoryResponseDto,
  })
  @ApiExceptionResponse()
  @Get('/:id')
  async getById(@Res() response: Response, @Param('id') id: number) {
    const category = await this.service.getCategoryById(id);

    return response.status(HttpStatus.OK).json(category);
  }
}
