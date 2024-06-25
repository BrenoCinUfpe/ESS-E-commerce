import { classes } from '@automapper/classes';
import {
  CamelCaseNamingConvention,
  SnakeCaseNamingConvention,
} from '@automapper/core';
import { AutomapperModule, getMapperToken } from '@automapper/nestjs';
import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { defineFeature, loadFeature } from 'jest-cucumber';

import { CategoriesRepository } from './categories.repository';
import { CategoriesService } from './categories.service';
import { CategoryEntity } from './entity/category.entity';

const feature = loadFeature('features/Categoria.feature');

defineFeature(feature, test => {
  let categoriesService: CategoriesService;
  let categoriesRepositoryMock: jest.Mocked<CategoriesRepository>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: CategoriesRepository,
          useFactory: () => ({
            exists: jest.fn(),
            create: jest.fn(),
            getById: jest.fn(),
            getAll: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          }),
        },
      ],
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
          namingConventions: {
            source: new CamelCaseNamingConvention(),
            destination: new SnakeCaseNamingConvention(),
          },
        }),
      ],
    }).compile();

    categoriesService = module.get<CategoriesService>(CategoriesService);
    categoriesRepositoryMock = module.get(CategoriesRepository);
  });

  test('Adicionar categoria', ({ given, when, then }) => {
    let result: CategoryEntity;
    let categoryName;
    let categoryImageURL;

    given(
      /^Não existe a categoria "([^"]*)" no repositório de categorias$/,
      async name => {
        categoriesRepositoryMock.exists.mockResolvedValue(
          Promise.resolve(false),
        );
        categoryName = name;
      },
    );

    when(
      /^Eu chamo o método "createCategory" do "CategoriesService" com o nome "([^"]*)" e imagem "([^"]*)"$/,
      async (name, image) => {
        categoryImageURL = image;

        // Mock the add method to return a Promise that resolves to an object with an ID
        categoriesRepositoryMock.create.mockResolvedValue(
          Promise.resolve({
            id: 1,
            name: categoryName,
            deletedAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            Media: {
              id: 1,
              url: categoryImageURL,
            },
            mediaId: 1,
          }),
        );

        result = await categoriesService.createCategory({
          name: categoryName,
          imageUrl: categoryImageURL,
        });
      },
    );

    then(
      /^Eu recebo a categoria criada com o nome "([^"]*)", imagem "([^"]*)", e ID "([^"]*)"$/,
      async id => {
        expect(result).toEqual(
          expect.objectContaining({
            id: 1,
            name: categoryName,
            Media: expect.objectContaining({
              id: 1,
              url: categoryImageURL,
            }),
            mediaId: 1,
          }),
        );
      },
    );

    then(
      /^A categoria de ID "([^"]*)", nome "([^"]*)" e imagem "([^"]*)" está no repositório de categorias$/,
      async (id, name, image) => {
        expect(categoriesRepositoryMock.create).toHaveBeenCalledWith(
          expect.objectContaining({
            name: name,
            Media: expect.objectContaining({
              create: expect.objectContaining({
                url: categoryImageURL,
              }),
            }),
          }),
        );
      },
    );
  });

  test('Adicionar categoria com o mesmo nome', ({ given, when, then }) => {
    let result: Promise<CategoryEntity>;
    let categoryId;
    let categoryName;
    let categoryImageURL;

    given(
      /^A categoria de ID "([^"]*)", nome "([^"]*)" e imagem "([^"]*)" existe no repositório de categorias$/,
      async (id, name, image) => {
        categoriesRepositoryMock.exists.mockResolvedValue(
          Promise.resolve(true),
        );
        categoryId = id;
        categoryName = name;
        categoryImageURL = image;
      },
    );

    when(
      /^Eu chamo o método "createCategory" do "CategoriesService" com o nome "([^"]*)" e imagem "([^"]*)"$/,
      async (name, image) => {
        // Mock the add method to return a Promise that resolves to an object with an ID
        categoriesRepositoryMock.create.mockResolvedValue(
          Promise.resolve({
            id: categoryId,
            name: categoryName,
            deletedAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            Media: {
              id: 1,
              url: categoryImageURL,
            },
            mediaId: 1,
          }),
        );

        result = categoriesService.createCategory({
          name: categoryName,
          imageUrl: categoryImageURL,
        });
      },
    );

    then(/^Eu recebo um erro$/, async () => {
      await expect(result).rejects.toThrow(ConflictException);
    });
  });

  test('Obter categoria por ID', ({ given, when, then }) => {
    let result: CategoryEntity;
    let categoryId;
    let categoryName;
    let categoryImageURL;

    given(
      /^A categoria de ID "([^"]*)", nome "([^"]*)" e imagem "([^"]*)" existe no repositório de categorias$/,
      async (id, name, image) => {
        categoriesRepositoryMock.exists.mockResolvedValue(
          Promise.resolve(true),
        );
        categoryId = parseInt(id, 10);
        categoryName = name;
        categoryImageURL = image;
      },
    );

    when(
      /^Eu chamo o metodo "getCategoryById" do "CategoriesService" com o ID "([^"]*)"$/,
      async id => {
        // Mock the add method to return a Promise that resolves to an object with an ID
        categoriesRepositoryMock.getById.mockResolvedValue(
          Promise.resolve({
            id: categoryId,
            name: categoryName,
            deletedAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            Media: {
              id: 1,
              url: categoryImageURL,
            },
            mediaId: 1,
          }),
        );

        result = await categoriesService.getCategoryById(categoryId);
      },
    );

    then(
      /^Eu recebo a categoria de ID "([^"]*)", nome "([^"]*)" e imagem "([^"]*)"$/,
      async () => {
        expect(result).toEqual(
          expect.objectContaining({
            id: categoryId,
            name: categoryName,
            Media: expect.objectContaining({
              url: categoryImageURL,
            }),
          }),
        );
      },
    );
  });

  test('Obter todas categorias', ({ given, when, then }) => {
    let result: CategoryEntity[];
    const categories: CategoryEntity[] = [
      {
        id: 1,
        name: 'Tênis',
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        Media: {
          id: 1,
          url: 'https://cdn-icons-png.flaticon.com/512/2589/2589903.png',
        },
        mediaId: 1,
      },
      {
        id: 2,
        name: 'Chinelo',
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        Media: {
          id: 2,
          url: 'https://static.thenounproject.com/png/2419291-200.png',
        },
        mediaId: 2,
      },
    ];

    given(/^Existem categorias no repositório de categorias$/, async () => {
      categoriesRepositoryMock.getAll.mockResolvedValue(
        Promise.resolve(categories),
      );
    });

    when(
      /^Eu chamo o método "getCategories" do "CategoriesService"$/,
      async () => {
        result = await categoriesService.getCategories();
      },
    );

    then(
      /^Eu recebo uma lista com todas categorias do repositório de categorias$/,
      async () => {
        expect(result).toEqual(expect.arrayContaining(categories));
      },
    );
  });

  test('Atualizar categoria', ({ given, when, then }) => {
    given(
      /^A categoria de ID "([^"]*)", nome "([^"]*)" e imagem "([^"]*)" existe no repositório de categorias$/,
      async (id, name, image) => {
        categoriesRepositoryMock.exists.mockResolvedValue(
          Promise.resolve(true),
        );
      },
    );

    when(
      /^Eu chamo o método "updateCategory" do "CategoriesService" com o ID "([^"]*)", nome "([^"]*)" e imagem "([^"]*)"$/,
      async (id, name, image) => {
        await categoriesService.updateCategory({
          id: parseInt(id, 10),
          name: name,
          imageUrl: image,
        });
      },
    );

    then(
      /^A categoria de ID "([^"]*)" agora possui nome "([^"]*)" e imagem "([^"]*)"$/,
      async (id, name, image) => {
        expect(categoriesRepositoryMock.update).toHaveBeenCalledWith(
          parseInt(id, 10),
          expect.objectContaining({
            name,
            Media: expect.objectContaining({
              update: expect.objectContaining({
                url: image,
              }),
            }),
          }),
        );
      },
    );
  });

  test('Deletar categoria', ({ given, when, then }) => {
    given(
      /^A categoria de ID "([^"]*)", nome "([^"]*)" e imagem "([^"]*)" existe no repositório de categorias$/,
      async (id, name, image) => {
        categoriesRepositoryMock.exists.mockResolvedValue(
          Promise.resolve(true),
        );
      },
    );

    when(
      /^Eu chamo o método "deleteCategory" do "CategoriesService" com o ID "([^"]*)"$/,
      async id => {
        await categoriesService.deleteCategory(parseInt(id, 10));
      },
    );

    then(
      /^A categoria de ID "([^"]*)" não existe no repositório de categorias$/,
      async id => {
        expect(categoriesRepositoryMock.delete).toHaveBeenCalledWith(
          parseInt(id, 10),
        );
      },
    );
  });
});
