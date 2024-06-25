import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { MessagesHelperKey, getMessage } from 'src/utils/messages.helper';
import { handleError } from 'src/utils/treat.exceptions';

import { CategoriesRepository } from './categories.repository';
import {
  CategoryCreateDto,
  CategoryUpdateDto,
} from './dto/request/category.create.dto';
import { CategoryEntity } from './entity/category.entity';

@Injectable()
export class CategoriesService {
  constructor(protected readonly categoriesRepository: CategoriesRepository) {}

  async createCategory(data: CategoryCreateDto): Promise<CategoryEntity> {
    const createCategoryData = {
      name: data.name,
      ...(data.imageUrl && {
        Media: {
          create: {
            url: data.imageUrl,
          },
        },
      }),
    };
    try {
      if (
        (await this.categoriesRepository.exists({
          name: createCategoryData.name.trim(),
        })) === true
      ) {
        throw new ConflictException(
          getMessage(MessagesHelperKey.CATEGORY_ALREADY_EXISTS),
        );
      }

      return await this.categoriesRepository.create(createCategoryData);
    } catch (error) {
      handleError(error);
    }
  }

  async getCategoryById(id: number): Promise<CategoryEntity> {
    try {
      const category = await this.categoriesRepository.getById(id);
      if (category === null) {
        throw new NotFoundException(
          getMessage(MessagesHelperKey.CATEGORY_NOT_FOUND),
        );
      }

      return category;
    } catch (error) {
      handleError(error);
    }
  }

  async getCategories(): Promise<CategoryEntity[]> {
    try {
      const categories = await this.categoriesRepository.getAll();
      if (categories === null) {
        throw new NotFoundException(
          getMessage(MessagesHelperKey.CATEGORY_NOT_FOUND),
        );
      }

      return categories;
    } catch (error) {
      handleError(error);
    }
  }

  async updateCategory(data: CategoryUpdateDto) {
    const categoryUpdateInput = {
      name: data.name,
      Media: {
        update: {
          url: data.imageUrl,
        },
      },
    };

    try {
      const category = await this.categoriesRepository.getById(data.id);
      if (category === null) {
        throw new NotFoundException(
          getMessage(MessagesHelperKey.CATEGORY_NOT_FOUND),
        );
      }

      this.categoriesRepository.update(data.id, categoryUpdateInput);
    } catch (error) {
      handleError(error);
    }
  }

  async deleteCategory(id: number) {
    try {
      const category = await this.categoriesRepository.getById(id);
      if (category === null) {
        throw new NotFoundException(
          getMessage(MessagesHelperKey.CATEGORY_NOT_FOUND),
        );
      }

      await this.categoriesRepository.delete(id);
    } catch (error) {
      handleError(error);
    }
  }
}
