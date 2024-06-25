import { classes } from '@automapper/classes';
import {
  createMapper,
  CamelCaseNamingConvention,
  SnakeCaseNamingConvention,
} from '@automapper/core';
import { AutomapperModule, getMapperToken } from '@automapper/nestjs';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { RoleEnum, StatusEnum } from '@prisma/client';
import { defineFeature, loadFeature } from 'jest-cucumber';
import { AuthRepository } from 'src/auth/auth.repository';
import { AuthService } from 'src/auth/auth.service';
import { UserPayload } from 'src/auth/models/UserPayload';
import { EmailService } from 'src/modules/email/email.service';
import { UserMapping } from 'src/modules/user/user.mapping';
import { UserRepository } from 'src/modules/user/user.repository';
import { UserService } from 'src/modules/user/user.service';

import { CartRepository } from './cart.repository';
import { CartService } from './cart.service';
import { CartProductEntity } from './entity/cart-product.entity';
import { CartEntity } from './entity/cart.entity';

const feature = loadFeature('features/carrinho.feature');

defineFeature(feature, test => {
  let userService: UserService;
  let authService: AuthService;
  let cartService: CartService;

  let userRepositoryMock: jest.Mocked<UserRepository>;
  let cartRepositoryMock: jest.Mocked<CartRepository>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        UserMapping,
        JwtService,
        AuthService,
        EmailService,
        CartService,
        {
          provide: UserRepository,
          useFactory: () => ({
            findById: jest.fn(),
            findByEmail: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          }),
        },
        {
          provide: CartRepository,
          useFactory: () => ({
            getCart: jest.fn(),
            addToCart: jest.fn(),
            removeFromCart: jest.fn(),
            attCart: jest.fn(),
            cartExists: jest.fn(),
            createCart: jest.fn(),
          }),
        },
        {
          provide: AuthRepository,
          useFactory: () => ({
            updateRefreshToken: jest.fn(() => Promise.resolve()),
          }),
        },
        {
          provide: getMapperToken(),
          useValue: createMapper({
            strategyInitializer: classes(),
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

    userService = module.get<UserService>(UserService);
    authService = module.get<AuthService>(AuthService);
    cartService = module.get<CartService>(CartService);
    userRepositoryMock = module.get(UserRepository);
    cartRepositoryMock = module.get(CartRepository);
  });

  beforeEach(() => {
    jest.resetAllMocks();

    authService.updateRt = jest.fn(() => Promise.resolve());
    authService.sendRegistrationEmail = jest.fn(() => Promise.resolve());
    authService.sendEmailRecovery = jest.fn(() => Promise.resolve());
  });

  test('Listar carrinho', ({ given, when, then }) => {
    let mock_id: number;
    let result: any;

    given(/^O usuário de ID "(.*)" está logado$/, async (id: string) => {
      mock_id = parseInt(id);
      cartRepositoryMock.getCart.mockResolvedValue({
        userId: mock_id,
        id: 1,
        locked: false,
        products: [
          {
            id: 1,
            name: 'Produto 1',
            price: 50.5,
            quantity: 1,
          },
          {
            id: 2,
            name: 'Produto 2',
            price: 45.45,
            quantity: 2,
          },
        ],
      } as any);
    });

    when('O usuário consulta seu carrinho', async () => {
      result = await cartService.getCart({ userId: mock_id });
    });

    then('O usuário recebe a lista de produtos em seu carrinho', () => {
      expect(result).toHaveProperty('userId', mock_id);
      expect(result).toHaveProperty('locked');
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('products');
      expect(result.products).toBeInstanceOf(Array);
      expect(result.products.length).toBeGreaterThan(0);
    });
  });

  test('Adicionar produto ao carrinho', ({ given, when, then, and }) => {
    let result: CartProductEntity;
    let currentUser: UserPayload;
    let mock_prod_id: number;
    let mock_cart_id: number;
    let mock_user_id: number;

    given(/^O usuário de ID "([^"]*)" está logado$/, async (id: string) => {
      mock_user_id = parseInt(id);
      currentUser = {
        id: mock_user_id,
        email: 'admin@gmail.com',
        sub: 'admin@gmail.com',
        name: 'cliente',
        role: RoleEnum.CUSTOMER,
        status: StatusEnum.ACTIVE,
        createdAt: new Date().toString(),
        iat: 0,
        exp: 0,
      };
    });

    and(/^Existe um produto de ID "([^"]*)"$/, async (id: string) => {
      mock_prod_id = parseInt(id);
    });

    and(
      /^O usuário possui um carrinho de ID "([^"]*)"$/,
      async (id: string) => {
        mock_cart_id = parseInt(id);
        cartRepositoryMock.getCart.mockResolvedValue({
          userId: mock_user_id,
          id: 1,
          locked: false,
          products: [
            {
              id: 1,
              name: 'Produto 1',
              price: 50.5,
              quantity: 1,
            },
            {
              id: 2,
              name: 'Produto 2',
              price: 45.45,
              quantity: 2,
            },
          ],
        } as any);
      },
    );

    when('O usuário tenta adicionar o produto ao seu carrinho', async () => {
      cartRepositoryMock.addToCart.mockResolvedValue({
        cartId: mock_cart_id,
        userId: mock_user_id,
        productId: mock_prod_id,
        quantity: 1,
      });

      result = await cartService.addToCart({
        cartId: mock_cart_id,
        userId: mock_user_id,
        productId: mock_prod_id,
        quantity: 1,
      });
    });

    then(
      'Deve ser recebido um objeto com informações da relação entre o produto e o carrinho',
      async () => {
        expect(result).toHaveProperty('cartId', mock_cart_id);
        expect(result).toHaveProperty('userId', mock_user_id);
        expect(result).toHaveProperty('productId', mock_prod_id);
        expect(result).toHaveProperty('quantity', 1);
      },
    );
  });

  test('Remover produto do carrinho', ({ given, when, then, and }) => {
    let result: CartProductEntity;
    let currentUser: UserPayload;
    let mock_prod_id: number;
    let mock_cart_id: number;
    let mock_user_id: number;

    given(/^O usuário de ID "([^"]*)" está logado$/, async (id: string) => {
      mock_user_id = parseInt(id);
      currentUser = {
        id: mock_user_id,
        email: 'admin@gmail.com',
        sub: 'admin@gmail.com',
        name: 'cliente',
        role: RoleEnum.CUSTOMER,
        status: StatusEnum.ACTIVE,
        createdAt: new Date().toString(),
        iat: 0,
        exp: 0,
      };
    });

    and(/^Existe um produto de ID "([^"]*)"$/, async (id: string) => {
      mock_prod_id = parseInt(id);
    });

    and(
      /^O usuário possui um carrinho de ID "([^"]*)"$/,
      async (id: string) => {
        mock_cart_id = parseInt(id);
      },
    );

    and('O usuário possui o produto especificado em seu carrinho', async () => {
      cartRepositoryMock.getCart.mockResolvedValue({
        userId: mock_user_id,
        id: 1,
        locked: false,
        products: [
          {
            id: 1,
            name: 'Produto 1',
            price: 50.5,
            quantity: 1,
          },
          {
            id: 2,
            name: 'Produto 2',
            price: 45.45,
            quantity: 2,
          },
        ],
      } as any);
    });

    when('O usuário tenta remover o produto ao seu carrinho', async () => {
      cartRepositoryMock.removeFromCart.mockResolvedValue({
        cartId: mock_cart_id,
        userId: mock_user_id,
        productId: mock_prod_id,
        quantity: 1,
      });

      result = await cartService.removeFromCart({
        cartId: mock_cart_id,
        userId: mock_user_id,
        productId: mock_prod_id,
        quantity: 1,
      });
    });

    then(
      'A relação deve ser excluída e deve ser recebido um objeto com informações da antiga relação entre o produto e o carrinho',
      async () => {
        expect(result).toHaveProperty('cartId', mock_cart_id);
        expect(result).toHaveProperty('userId', mock_user_id);
        expect(result).toHaveProperty('productId', mock_prod_id);
        expect(result).toHaveProperty('quantity');
      },
    );
  });

  //----------------

  test('Atualizar quantidade de produto no carrinho', ({
    given,
    when,
    then,
    and,
  }) => {
    let result: CartProductEntity;
    let currentUser: UserPayload;
    let mock_prod_id: number;
    let mock_cart_id: number;
    let mock_user_id: number;

    let quantidade: number;

    given(/^O usuário de ID "([^"]*)" está logado$/, async (id: string) => {
      mock_user_id = parseInt(id);
      currentUser = {
        id: mock_user_id,
        email: 'admin@gmail.com',
        sub: 'admin@gmail.com',
        name: 'cliente',
        role: RoleEnum.CUSTOMER,
        status: StatusEnum.ACTIVE,
        createdAt: new Date().toString(),
        iat: 0,
        exp: 0,
      };
    });

    and(/^Existe um produto de ID "([^"]*)"$/, async (id: string) => {
      mock_prod_id = parseInt(id);
    });

    and(
      /^O usuário possui um carrinho de ID "([^"]*)"$/,
      async (id: string) => {
        mock_cart_id = parseInt(id);
      },
    );

    and(
      /^O usuário possui "([^"]*)" unidades do produto especificado em seu carrinho$/,
      async quantity => {
        cartRepositoryMock.getCart.mockResolvedValue({
          userId: mock_user_id,
          id: 1,
          locked: false,
          products: [
            {
              id: 1,
              name: 'Produto 1',
              price: 50.5,
              quantity: 1,
            },
            {
              id: 2,
              name: 'Produto 2',
              price: 45.45,
              quantity: 2,
            },
          ],
        } as any);

        quantidade = parseInt(quantity);
      },
    );

    when(
      'O usuário tenta aumentar em 1 a quantidade de unidades do produto em seu carrinho',
      async () => {
        cartRepositoryMock.attCart.mockResolvedValue({
          cartId: mock_cart_id,
          userId: mock_user_id,
          productId: mock_prod_id,
          quantity: quantidade + 1,
        });

        result = await cartService.attCart({
          cartId: mock_cart_id,
          userId: mock_user_id,
          productId: mock_prod_id,
          quantity: quantidade + 1,
        });
      },
    );

    then(
      'Deve ser recebido um objeto com as novas informações definidas da relação entre o produto e o carrinho',
      async () => {
        expect(result).toHaveProperty('cartId', mock_cart_id);
        expect(result).toHaveProperty('userId', mock_user_id);
        expect(result).toHaveProperty('productId', mock_prod_id);
        expect(result).toHaveProperty('quantity', quantidade + 1);
      },
    );
  });
});
