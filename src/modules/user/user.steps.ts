import { classes } from '@automapper/classes';
import {
  createMapper,
  CamelCaseNamingConvention,
  SnakeCaseNamingConvention,
} from '@automapper/core';
import { AutomapperModule, getMapperToken } from '@automapper/nestjs';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderStatus, RoleEnum, StatusEnum } from '@prisma/client';
import { defineFeature, loadFeature } from 'jest-cucumber';
import { any, anyObject, anyString } from 'jest-mock-extended';
import { AuthRepository } from 'src/auth/auth.repository';
import { AuthService } from 'src/auth/auth.service';
import { ChangePasswordByRecovery } from 'src/auth/dto/request/change-password-by-recovery.dto';
import { LoginDto } from 'src/auth/dto/request/login.dto';
import { UserToken } from 'src/auth/dto/response/UserToken';
import { UserPayload } from 'src/auth/models/UserPayload';
import { EmailService } from 'src/modules/email/email.service';
import { UpdateUserPassword } from 'src/modules/user/dto/request/update.personal.password.dto';
import { UserCreateDto } from 'src/modules/user/dto/request/user.create.dto';
import { UserEntity } from 'src/modules/user/entity/user.entity';
import { UserMapping } from 'src/modules/user/user.mapping';
import { UserRepository } from 'src/modules/user/user.repository';
import { UserService } from 'src/modules/user/user.service';
import { hashData } from 'src/utils/hash';

import { UpdateUserPersonalData } from './dto/request/update.personal.data.dto';

const feature = loadFeature('features/users.feature');

defineFeature(feature, test => {
  let userService: UserService;
  let authService: AuthService;
  let userRepositoryMock: jest.Mocked<UserRepository>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        UserMapping,
        JwtService,
        AuthService,
        EmailService,
        {
          provide: UserRepository,
          useFactory: () => ({
            createAsync: jest.fn(),
            deleteAsync: jest.fn(),
            updateAsync: jest.fn(),
            exists: jest.fn(),
            findBy: jest.fn(),
            findByIdAsync: jest.fn(),
            findFilteredAsync: jest.fn(),
            findByEmail: jest.fn(),
            updateUserPassword: jest.fn(),
            updateUserPersonalData: jest.fn(),
            getOrders: jest.fn(),
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
          useFactory: () => ({
            map: jest.fn(),
            mapArray: jest.fn(),
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
    userRepositoryMock = module.get(UserRepository);
  });

  beforeEach(() => {
    jest.resetAllMocks();

    authService.updateRt = jest.fn(() => Promise.resolve());
    authService.sendRegistrationEmail = jest.fn(() => Promise.resolve());
    authService.sendEmailRecovery = jest.fn(() => Promise.resolve());
  });

  test('Criar um novo usuário com sucesso', ({ given, when, then, and }) => {
    let result: UserEntity;
    let createUserDto: UserCreateDto;
    let userName: string;
    let userEmail: string;
    let userPassword: string;

    given(/^que não existe um usuário com o email "([^"]*)"$/, async email => {
      userRepositoryMock.exists.mockResolvedValue(Promise.resolve(false));
      userEmail = email;
    });

    given(
      /^o dado de criação do usuário contém o nome "([^"]*)", o email "([^"]*)" e a senha "([^"]*)"$/,
      (name, email, password) => {
        createUserDto = { name, email, password };
        userName = name;
        userEmail = email;
        userPassword = password;
      },
    );

    when('o serviço de autenticação registra o usuário', async () => {
      const mockReturn: UserEntity = {
        id: 1,
        name: userName,
        email: userEmail,
        password: await hashData(userPassword),
        refreshToken: null,
        recoveryPasswordToken: '',
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: null,
        status: StatusEnum.ACTIVE,
        Media: null,
        mediaId: null,
        role: RoleEnum.CUSTOMER,
      };

      userRepositoryMock.createAsync.mockResolvedValue(
        Promise.resolve(mockReturn),
      );

      result = await authService.register(createUserDto);
    });

    then(
      /^o usuário deve ser criado com nome "([^"]*)" e email "([^"]*)"$/,
      (name, email) => {
        expect(result).toEqual(
          expect.objectContaining({
            password: expect.any(String),
            email: email,
            name: name,
          }),
        );
      },
    );

    then('o status do usuário deve ser "ACTIVE"', () => {
      expect(result.status).toBe(StatusEnum.ACTIVE);
    });

    then(
      /^o repositório de usuários deve verificar a existência de um usuário com o email "([^"]*)"$/,
      email => {
        expect(userRepositoryMock.exists).toHaveBeenCalledWith({ email });
      },
    );

    then(
      /^o repositório de usuários deve criar o usuário com nome "([^"]*)", email "([^"]*)" e status "ACTIVE"$/,
      (name, email) => {
        expect(userRepositoryMock.createAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            name: name,
            email: email,
            status: StatusEnum.ACTIVE,
            role: RoleEnum.CUSTOMER,
          }),
        );
      },
    );
  });

  test('Tentar registrar um usuário com um email já utilizado', ({
    given,
    when,
    then,
  }) => {
    let createUserDto: UserCreateDto;
    let userEmail: string;

    given(/^que já existe um usuário com o email "([^"]*)"$/, async email => {
      userRepositoryMock.exists.mockResolvedValue(Promise.resolve(true));
      userEmail = email;
    });

    given(
      /^o dado de criação do usuário contém o nome "([^"]*)", o email "([^"]*)" e a senha "([^"]*)"$/,
      (name, email, password) => {
        createUserDto = { name, email, password };
        userEmail = email;
      },
    );

    let createUser = () => {};
    when('o serviço de autenticação tenta registrar o usuário', async () => {
      createUser = async () => await authService.register(createUserDto);
    });

    then('deve lançar uma ConflictException', async () => {
      await expect(createUser).rejects.toThrow(ConflictException);
      expect(userRepositoryMock.exists).toHaveBeenCalledWith({
        email: userEmail,
      });
    });
  });

  test('Definir o status do usuário como "Inativo"', ({
    given,
    when,
    then,
    and,
  }) => {
    let userId: number;

    given(
      /^existe um usuário com o ID (\d+) e email "([^"]*)" com status "ACTIVE"$/,
      async (id, email) => {
        userId = parseInt(id, 10);
        const userToUpdate: UserEntity = {
          id: userId,
          name: 'cliente cadastro',
          email: email,
          password: await hashData('mockValue'),
          refreshToken: null,
          recoveryPasswordToken: '',
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: null,
          status: StatusEnum.ACTIVE,
          Media: null,
          mediaId: null,
          role: RoleEnum.CUSTOMER,
        };

        userRepositoryMock.findByEmail.mockResolvedValue(userToUpdate);
        userRepositoryMock.exists.mockResolvedValue(Promise.resolve(true));
        userRepositoryMock.deleteAsync.mockResolvedValue(Promise.resolve());
        userRepositoryMock.findByIdAsync.mockResolvedValue(userToUpdate);
      },
    );

    given(/^o ID do usuário a ser deletado é (\d+)$/, id => {
      userId = parseInt(id, 10);
    });

    when('o serviço de usuário deleta o usuário', async () => {
      await userService.deleteAsync(userId);
    });

    then(
      /^o repositório de usuários deve encontrar o usuário pelo ID (\d+)$/,
      id => {
        expect(userRepositoryMock.findByIdAsync).toHaveBeenCalledWith(
          parseInt(id, 10),
        );
      },
    );

    and(
      /^o repositório de usuários deve verificar a existência do usuário com ID (\d+)$/,
      id => {
        expect(userRepositoryMock.exists).toHaveBeenCalledWith({
          id: parseInt(id, 10),
        });
      },
    );

    and(
      /^o repositório de usuários deve deletar o usuário com ID (\d+)$/,
      id => {
        expect(userRepositoryMock.deleteAsync).toHaveBeenCalledWith(
          parseInt(id, 10),
        );
      },
    );
  });

  test('Tentar deletar um usuário já inativo', ({ given, when, then }) => {
    let userId: number;

    given(
      /^existe um usuário com o ID (\d+) e email "([^"]*)" com status "INACTIVE"$/,
      async (id, email) => {
        userId = parseInt(id, 10);
        const inactiveUser: UserEntity = {
          id: userId,
          name: 'cliente cadastro',
          email: email,
          password: await hashData('mockValue'),
          refreshToken: null,
          recoveryPasswordToken: '',
          deletedAt: new Date(),
          createdAt: new Date(),
          updatedAt: null,
          status: StatusEnum.INACTIVE,
          Media: null,
          mediaId: null,
          role: RoleEnum.CUSTOMER,
        };

        userRepositoryMock.exists.mockResolvedValue(Promise.resolve(true));
        userRepositoryMock.findByIdAsync.mockResolvedValue(inactiveUser);
      },
    );

    given(/^o ID do usuário a ser deletado é (\d+)$/, id => {
      userId = parseInt(id, 10);
    });

    when('o serviço de usuário tenta deletar o usuário', async () => {
      const deleteUser = async () => await userService.deleteAsync(userId);
      await expect(deleteUser).rejects.toThrow(ForbiddenException);
    });

    then('deve lançar uma ForbiddenException', () => {
      expect(userRepositoryMock.findByIdAsync).toHaveBeenCalledWith(userId);
    });
  });

  test('Tentar deletar um usuário que não existe', ({
    given,
    when,
    then,
    and,
  }) => {
    let userId: number;

    given(/^o ID do usuário a ser deletado é (\d+)$/, id => {
      userId = parseInt(id, 10);
    });

    and(/^o usuário com ID (\d+) não existe$/, async id => {
      userRepositoryMock.exists.mockResolvedValue(false);
    });

    let deleteUser = () => {};

    when('o serviço de usuário tenta deletar o usuário', async () => {
      deleteUser = async () => await userService.deleteAsync(userId);
    });

    then('deve lançar uma NotFoundException', async () => {
      await expect(deleteUser).rejects.toThrow(NotFoundException);
      expect(userRepositoryMock.exists).toHaveBeenCalledWith({ id: userId });
    });
  });

  test('Atualizar os dados de registro do usuário logado', ({
    given,
    when,
    then,
    and,
  }) => {
    let currentUser: UserPayload;
    let updatedName: string;
    let updateUserPersonalDataDto: UpdateUserPersonalData;

    given(
      /^existe um usuário logado com ID (\d+) e email "([^"]*)"$/,
      (id, email) => {
        currentUser = {
          id: parseInt(id, 10),
          email: email,
          sub: email,
          name: 'cliente',
          role: RoleEnum.CUSTOMER,
          status: StatusEnum.ACTIVE,
          createdAt: new Date().toString(),
          iat: 0,
          exp: 0,
        };
      },
    );

    given(/^o nome atualizado do usuário é "([^"]*)"$/, name => {
      updatedName = name;
    });

    given(
      /^o dado de atualização dos dados pessoais contém "([^"]*)"$/,
      async name => {
        updateUserPersonalDataDto = { name: name };

        const existingUser: UserEntity = {
          id: currentUser.id,
          name: 'administrador cliente',
          email: currentUser.email,
          password: await hashData('mockValue'),
          refreshToken: null,
          recoveryPasswordToken: '',
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: StatusEnum.ACTIVE,
          Media: null,
          mediaId: null,
          role: RoleEnum.CUSTOMER,
        };

        userRepositoryMock.findByIdAsync.mockResolvedValue(existingUser);
        userRepositoryMock.updateAsync.mockResolvedValue({
          ...existingUser,
          name: updatedName,
        });
      },
    );

    when(
      'o serviço de usuário atualiza os dados pessoais do usuário logado',
      async () => {
        await userService.updateUserPersonalData(
          updateUserPersonalDataDto,
          currentUser,
        );
      },
    );

    then(
      /^o repositório de usuários deve encontrar o usuário pelo ID (\d+)$/,
      id => {
        expect(userRepositoryMock.findByIdAsync).toHaveBeenCalledWith(
          parseInt(id, 10),
        );
      },
    );

    and(
      /^o repositório de usuários deve atualizar o usuário com nome "([^"]*)"$/,
      name => {
        expect(userRepositoryMock.updateAsync).toHaveBeenCalledWith(
          currentUser.id,
          { name: name },
        );
      },
    );
  });

  test('Não atualizar se nenhum dado for fornecido', ({
    given,
    when,
    then,
  }) => {
    let currentUser: UserPayload;
    let updateUserPersonalDataDto: UpdateUserPersonalData;

    given(
      /^existe um usuário logado com ID (\d+) e email "([^"]*)"$/,
      (id, email) => {
        currentUser = {
          id: parseInt(id, 10),
          email: email,
          sub: email,
          name: 'cliente',
          role: RoleEnum.CUSTOMER,
          status: StatusEnum.ACTIVE,
          createdAt: new Date().toString(),
          iat: 0,
          exp: 0,
        };
      },
    );

    given('o dado de atualização dos dados pessoais está vazio', () => {
      updateUserPersonalDataDto = {};
    });

    when(
      'o serviço de usuário tenta atualizar os dados pessoais do usuário logado',
      async () => {
        await userService.updateUserPersonalData(
          updateUserPersonalDataDto,
          currentUser,
        );
      },
    );

    then(
      'o repositório de usuários não deve ser chamado para encontrar o usuário',
      () => {
        expect(userRepositoryMock.findByIdAsync).not.toHaveBeenCalled();
      },
    );

    then(
      'o repositório de usuários não deve ser chamado para atualizar o usuário',
      () => {
        expect(userRepositoryMock.updateAsync).not.toHaveBeenCalled();
      },
    );
  });

  test('Lançar erro se o usuário não for encontrado', ({
    given,
    when,
    then,
    and,
  }) => {
    let currentUser: UserPayload;
    let updatedName: string;
    let updateUserPersonalDataDto: UpdateUserPersonalData;

    given(/^o ID do usuário logado é (\d+)$/, id => {
      currentUser = {
        id: parseInt(id, 10),
        email: 'cliente123@gmail.com',
        sub: 'cliente123@gmail.com',
        name: 'cliente',
        role: RoleEnum.CUSTOMER,
        status: StatusEnum.ACTIVE,
        createdAt: new Date().toString(),
        iat: 0,
        exp: 0,
      };
    });

    given(/^o nome atualizado do usuário é "([^"]*)"$/, name => {
      updatedName = name;
    });

    given(
      /^o dado de atualização dos dados pessoais contém "([^"]*)"$/,
      name => {
        updateUserPersonalDataDto = { name: name };
      },
    );

    and(/^o usuário com ID (\d+) não existe$/, async id => {
      userRepositoryMock.findByIdAsync.mockResolvedValue(null);
    });

    let updateUser = () => {};

    when(
      'o serviço de usuário tenta atualizar os dados pessoais do usuário logado',
      async () => {
        updateUser = async () =>
          await userService.updateUserPersonalData(
            updateUserPersonalDataDto,
            currentUser,
          );
      },
    );

    then('deve lançar uma NotFoundException', async () => {
      await expect(updateUser).rejects.toThrow(NotFoundException);
      expect(userRepositoryMock.findByIdAsync).toHaveBeenCalledWith(
        currentUser.id,
      );
    });
  });

  test('Lançar erro se o usuário estiver inativo ou deletado', ({
    given,
    when,
    then,
    and,
  }) => {
    let currentUser: UserPayload;
    let updatedName: string;
    let updateUserPersonalDataDto: UpdateUserPersonalData;

    given(/^o ID do usuário logado é (\d+)$/, id => {
      currentUser = {
        id: parseInt(id, 10),
        email: 'cliente123@gmail.com',
        sub: 'cliente123@gmail.com',
        name: 'cliente',
        role: RoleEnum.CUSTOMER,
        status: StatusEnum.ACTIVE,
        createdAt: new Date().toString(),
        iat: 0,
        exp: 0,
      };
    });

    given(/^o nome atualizado do usuário é "([^"]*)"$/, name => {
      updatedName = name;
    });

    given(
      /^o dado de atualização dos dados pessoais contém "([^"]*)"$/,
      name => {
        updateUserPersonalDataDto = { name: name };
      },
    );

    and(/^o usuário com ID (\d+) está inativo ou deletado$/, async id => {
      const inactiveUser: UserEntity = {
        id: parseInt(id, 10),
        name: 'administrador cliente',
        email: 'cliente123@gmail.com',
        password: await hashData('mockValue'),
        refreshToken: null,
        recoveryPasswordToken: '',
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: StatusEnum.INACTIVE,
        Media: null,
        mediaId: null,
        role: RoleEnum.CUSTOMER,
      };

      userRepositoryMock.findByIdAsync.mockResolvedValue(inactiveUser);
    });

    let updateUser = () => {};

    when(
      'o serviço de usuário tenta atualizar os dados pessoais do usuário logado',
      async () => {
        updateUser = async () =>
          await userService.updateUserPersonalData(
            updateUserPersonalDataDto,
            currentUser,
          );
      },
    );

    then('deve lançar uma ForbiddenException', async () => {
      await expect(updateUser).rejects.toThrow(ForbiddenException);

      expect(userRepositoryMock.findByIdAsync).toHaveBeenCalledWith(
        currentUser.id,
      );
    });
  });

  test('Atualizar a senha do usuário logado', ({ given, when, then, and }) => {
    let currentUser: UserPayload;
    let currentPassword: string;
    let newPassword: string;
    let updateUserPasswordDto: UpdateUserPassword;

    given(
      /^existe um usuário logado com ID (\d+) e email "([^"]*)"$/,
      (id, email) => {
        currentUser = {
          id: parseInt(id, 10),
          email: email,
          sub: email,
          name: 'cliente',
          role: RoleEnum.CUSTOMER,
          status: StatusEnum.ACTIVE,
          createdAt: new Date().toString(),
          iat: 0,
          exp: 0,
        };
      },
    );

    given(/^a senha atual é "([^"]*)"$/, password => {
      currentPassword = password;
    });

    given(/^a nova senha é "([^"]*)"$/, password => {
      newPassword = password;
    });

    given(
      /^o dado de atualização de senha contém "([^"]*)" e "([^"]*)"$/,
      async (actualPassword, password) => {
        updateUserPasswordDto = { actualPassword, newPassword: password };

        const currentPasswordHashed = await hashData(actualPassword);
        const existingUser: UserEntity = {
          id: currentUser.id,
          name: 'Administrador',
          email: currentUser.email,
          password: currentPasswordHashed,
          refreshToken: null,
          recoveryPasswordToken: '',
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: StatusEnum.ACTIVE,
          Media: null,
          mediaId: null,
          role: RoleEnum.ADMIN,
        };

        userRepositoryMock.findByIdAsync.mockResolvedValue(existingUser);
        userRepositoryMock.updateUserPassword.mockResolvedValue(
          Promise.resolve(),
        );
      },
    );

    when(
      'o serviço de usuário atualiza a senha do usuário logado',
      async () => {
        await userService.updateUserPassword(
          updateUserPasswordDto,
          currentUser,
        );
      },
    );

    then(
      /^o repositório de usuários deve encontrar o usuário pelo ID (\d+)$/,
      id => {
        expect(userRepositoryMock.findByIdAsync).toHaveBeenCalledWith(
          parseInt(id, 10),
        );
      },
    );

    then('o repositório de usuários deve atualizar a senha do usuário', () => {
      expect(userRepositoryMock.updateUserPassword).toHaveBeenCalledWith(
        currentUser.id,
        expect.any(String),
      );
    });
  });

  test('Lançar erro se a senha atual for a mesma que a nova senha', ({
    given,
    when,
    then,
  }) => {
    let currentUser: UserPayload;
    let password: string;
    let updateUserPasswordDto: UpdateUserPassword;

    given(
      /^existe um usuário logado com ID (\d+) e email "([^"]*)"$/,
      (id, email) => {
        currentUser = {
          id: parseInt(id, 10),
          email: email,
          sub: email,
          name: 'cliente',
          role: RoleEnum.CUSTOMER,
          status: StatusEnum.ACTIVE,
          createdAt: new Date().toString(),
          iat: 0,
          exp: 0,
        };
      },
    );

    given(/^a senha atual e a nova senha são "([^"]*)"$/, pass => {
      password = pass;
    });

    given(
      /^o dado de atualização de senha contém "([^"]*)" e "([^"]*)"$/,
      (actualPassword, newPass) => {
        updateUserPasswordDto = { actualPassword, newPassword: newPass };
      },
    );

    let updateUserPassword = () => {};

    when(
      'o serviço de usuário tenta atualizar a senha do usuário logado',
      async () => {
        updateUserPassword = async () =>
          await userService.updateUserPassword(
            updateUserPasswordDto,
            currentUser,
          );
      },
    );

    then('deve lançar uma BadRequestException', async () => {
      await expect(updateUserPassword).rejects.toThrow(BadRequestException);
      expect(userRepositoryMock.updateUserPassword).not.toHaveBeenCalled();
    });
  });

  test('Lançar erro se a senha atual estiver incorreta', ({
    given,
    when,
    then,
  }) => {
    let currentUser: UserPayload;
    let currentPassword: string;
    let wrongPassword: string;
    let newPassword: string;
    let updateUserPasswordDto: UpdateUserPassword;

    given(
      /^existe um usuário logado com ID (\d+) e email "([^"]*)"$/,
      async (id, email) => {
        currentUser = {
          id: parseInt(id, 10),
          email: email,
          sub: email,
          name: 'cliente',
          role: RoleEnum.CUSTOMER,
          status: StatusEnum.ACTIVE,
          createdAt: new Date().toString(),
          iat: 0,
          exp: 0,
        };
      },
    );

    given(/^a senha atual é "([^"]*)"$/, password => {
      currentPassword = password;
    });

    given(/^a senha incorreta é "([^"]*)"$/, password => {
      wrongPassword = password;
    });

    given(/^a nova senha é "([^"]*)"$/, password => {
      newPassword = password;
    });

    given(
      /^o dado de atualização de senha contém "([^"]*)" e "([^"]*)"$/,
      async (actualPassword, newPass) => {
        updateUserPasswordDto = { actualPassword, newPassword: newPass };

        const existingUser: UserEntity = {
          id: currentUser.id,
          name: 'Administrador',
          email: currentUser.email,
          password: await hashData(currentPassword),
          refreshToken: null,
          recoveryPasswordToken: '',
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: StatusEnum.ACTIVE,
          Media: null,
          mediaId: null,
          role: RoleEnum.ADMIN,
        };

        userRepositoryMock.findByIdAsync.mockResolvedValue(existingUser);
      },
    );

    let updateUserPassword = () => {};

    when(
      'o serviço de usuário tenta atualizar a senha do usuário logado',
      async () => {
        updateUserPassword = async () =>
          await userService.updateUserPassword(
            updateUserPasswordDto,
            currentUser,
          );
      },
    );

    then('deve lançar uma BadRequestException', async () => {
      await expect(updateUserPassword).rejects.toThrow(BadRequestException);
      expect(userRepositoryMock.updateUserPassword).not.toHaveBeenCalled();
    });
  });

  test('Deletar o usuário', ({ given, when, then }) => {
    let userId: number;

    given(
      /^existe um usuário com ID (\d+) e email "([^"]*)" com status "ACTIVE"$/,
      async (id, email) => {
        userId = parseInt(id, 10);
        const existingUser: UserEntity = {
          id: userId,
          name: 'cliente',
          email: email,
          password: await hashData('Senha@123'),
          refreshToken: null,
          recoveryPasswordToken: '',
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: StatusEnum.ACTIVE,
          Media: null,
          mediaId: null,
          role: RoleEnum.CUSTOMER,
        };

        userRepositoryMock.exists.mockResolvedValue(true);
        userRepositoryMock.findByIdAsync.mockResolvedValue(existingUser);
      },
    );

    given(/^o ID do usuário a ser deletado é (\d+)$/, id => {
      userId = parseInt(id, 10);
    });

    when('o serviço de usuário deleta o usuário', async () => {
      await userService.deleteAsync(userId);
    });

    then(
      /^o repositório de usuários deve deletar o usuário com ID (\d+)$/,
      id => {
        expect(userRepositoryMock.deleteAsync).toHaveBeenCalledWith(
          parseInt(id, 10),
        );
      },
    );
  });

  test('Lançar BadRequestException se o ID for nulo', ({ when, then }) => {
    let deleteUser = () => {};
    when(
      'o serviço de usuário tenta deletar um usuário com ID nulo',
      async () => {
        deleteUser = async () => await userService.deleteAsync(null);
      },
    );

    then('deve lançar uma BadRequestException', async () => {
      await expect(deleteUser).rejects.toThrow(BadRequestException);
      expect(userRepositoryMock.deleteAsync).not.toHaveBeenCalled();
    });
  });

  test('Lançar NotFoundException se o usuário não existir', ({
    given,
    when,
    then,
  }) => {
    let userId: number;

    given(/^o ID do usuário a ser deletado é (\d+)$/, id => {
      userId = parseInt(id, 10);
    });

    given(/^o usuário com ID (\d+) não existe$/, async id => {
      userRepositoryMock.exists.mockResolvedValue(false);
    });

    let deleteUser = () => {};

    when('o serviço de usuário tenta deletar o usuário', async () => {
      deleteUser = async () => await userService.deleteAsync(userId);
    });

    then('deve lançar uma NotFoundException', async () => {
      await expect(deleteUser).rejects.toThrow(NotFoundException);
      expect(userRepositoryMock.exists).toHaveBeenCalledWith({ id: userId });
    });
  });

  test('Lançar ForbiddenException se o usuário já estiver inativo', ({
    given,
    when,
    then,
  }) => {
    let userId: number;

    given(
      /^existe um usuário com ID (\d+) e email "([^"]*)" com status "INACTIVE"$/,
      async (id, email) => {
        userId = parseInt(id, 10);
        const existingUser: UserEntity = {
          id: userId,
          name: 'cliente',
          email: email,
          password: await hashData('Senha@123'),
          refreshToken: null,
          recoveryPasswordToken: '',
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: StatusEnum.INACTIVE,
          Media: null,
          mediaId: null,
          role: RoleEnum.CUSTOMER,
        };

        userRepositoryMock.exists.mockResolvedValue(true);
        userRepositoryMock.findByIdAsync.mockResolvedValue(existingUser);
      },
    );

    given(/^o ID do usuário a ser deletado é (\d+)$/, id => {
      userId = parseInt(id, 10);
    });

    let deleteUser = () => {};

    when('o serviço de usuário tenta deletar o usuário', async () => {
      deleteUser = async () => await userService.deleteAsync(userId);
    });

    then('deve lançar uma ForbiddenException', async () => {
      await expect(deleteUser).rejects.toThrow(ForbiddenException);
      expect(userRepositoryMock.findByIdAsync).toHaveBeenCalledWith(userId);
    });
  });

  test('Lançar ForbiddenException se o usuário for um administrador', ({
    given,
    when,
    then,
  }) => {
    let userId: number;

    given(
      /^existe um usuário com ID (\d+) e email "([^"]*)" com status "ACTIVE" e papel "ADMIN"$/,
      async (id, email) => {
        userId = parseInt(id, 10);
        const existingUser: UserEntity = {
          id: userId,
          name: 'admin',
          email: email,
          password: await hashData('Senha@123'),
          refreshToken: null,
          recoveryPasswordToken: '',
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: StatusEnum.ACTIVE,
          Media: null,
          mediaId: null,
          role: RoleEnum.ADMIN,
        };

        userRepositoryMock.exists.mockResolvedValue(true);
        userRepositoryMock.findByIdAsync.mockResolvedValue(existingUser);
      },
    );

    given(/^o ID do usuário a ser deletado é (\d+)$/, id => {
      userId = parseInt(id, 10);
    });

    let deleteUser = () => {};
    when('o serviço de usuário tenta deletar o usuário', async () => {
      deleteUser = async () => await userService.deleteAsync(userId);
    });

    then('deve lançar uma ForbiddenException', async () => {
      await expect(deleteUser).rejects.toThrow(ForbiddenException);
      expect(userRepositoryMock.findByIdAsync).toHaveBeenCalledWith(userId);
    });
  });

  test('Validar usuário com sucesso', ({ given, when, then }) => {
    let userEmail: string;
    let userPassword: string;
    let result: Omit<UserEntity, 'password'>;

    given(/^que o usuário inseriu no campo email o valor "([^"]*)"$/, email => {
      userEmail = email;
    });

    given(/^o usuário inseriu no campo senha o valor "([^"]*)"$/, password => {
      userPassword = password;
    });

    given(
      /^existe um usuário no sistema com o email "([^"]*)" e com a senha "([^"]*)"$/,
      async (email, password) => {
        const existingUser: UserEntity = {
          id: 1,
          name: 'administrador cliente',
          email: email,
          password: await hashData(password),
          refreshToken: null,
          recoveryPasswordToken: '',
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: StatusEnum.ACTIVE,
          Media: null,
          mediaId: null,
          role: RoleEnum.CUSTOMER,
        };

        jest.spyOn(userService, 'findByEmail').mockResolvedValue(existingUser);
      },
    );

    when('tenta logar no sistema', async () => {
      result = await authService.validateUser(userEmail, userPassword);
    });

    then(
      /^o usuário deve receber o próprio usuário validado com o email$/,
      () => {
        expect(result).toBeDefined();
        expect(result.email).toEqual(userEmail);
      },
    );
  });

  test('Lançar UnauthorizedException se o usuário não for encontrado', ({
    given,
    when,
    then,
  }) => {
    let userEmail: string;
    let userPassword: string;

    given(/^que o usuário inseriu no campo email o valor "([^"]*)"$/, email => {
      userEmail = email;
    });

    given(/^o usuário inseriu no campo senha o valor "([^"]*)"$/, password => {
      userPassword = password;
    });

    given(
      /^não existe um usuário no sistema com o email "([^"]*)"$/,
      async email => {
        jest.spyOn(userService, 'findByEmail').mockResolvedValue(null);
      },
    );

    let validateUser: () => Promise<Omit<UserEntity, 'password'>>;

    when('fazer login no sistema', async () => {
      validateUser = async () =>
        await authService.validateUser(userEmail, userPassword);
    });

    then('deve lançar uma UnauthorizedException', async () => {
      await expect(validateUser).rejects.toThrow(UnauthorizedException);
    });
  });

  test('Lançar UnauthorizedException se o usuário estiver inativo', ({
    given,
    when,
    then,
  }) => {
    let userEmail: string;
    let userPassword: string;

    given(/^que o usuário inseriu no campo email o valor "([^"]*)"$/, email => {
      userEmail = email;
    });

    given(/^o usuário inseriu no campo senha o valor "([^"]*)"$/, password => {
      userPassword = password;
    });

    given(
      /^existe um usuário inativo no sistema com o email "([^"]*)" e com a senha "([^"]*)"$/,
      async (email, password) => {
        const inactiveUser: UserEntity = {
          id: 1,
          name: 'administrador cliente',
          email: email,
          password: await hashData(password),
          refreshToken: null,
          recoveryPasswordToken: '',
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: StatusEnum.INACTIVE,
          Media: null,
          mediaId: null,
          role: RoleEnum.CUSTOMER,
        };

        jest.spyOn(userService, 'findByEmail').mockResolvedValue(inactiveUser);
      },
    );

    let validateUser: () => Promise<Omit<UserEntity, 'password'>>;

    when('tenta fazer login no sistema', async () => {
      validateUser = async () =>
        await authService.validateUser(userEmail, userPassword);
    });

    then('deve lançar uma UnauthorizedException', async () => {
      await expect(validateUser).rejects.toThrow(UnauthorizedException);
    });
  });

  test('Lançar UnauthorizedException se a senha for inválida', ({
    given,
    when,
    then,
  }) => {
    let userEmail: string;
    let wrongUserPassword: string;

    given(/^que o usuário inseriu no campo email o valor "([^"]*)"$/, email => {
      userEmail = email;
    });

    given(/^o usuário inseriu no campo senha o valor "([^"]*)"$/, password => {
      wrongUserPassword = password;
    });

    given(
      /^não existe um usuário no sistema com o email "([^"]*)"$/,
      async email => {
        const existingUser: UserEntity = {
          id: 1,
          name: 'administrador cliente',
          email: email,
          password: await hashData('teste'),
          refreshToken: null,
          recoveryPasswordToken: '',
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: StatusEnum.ACTIVE,
          Media: null,
          mediaId: null,
          role: RoleEnum.CUSTOMER,
        };

        jest.spyOn(userService, 'findByEmail').mockResolvedValue(existingUser);
      },
    );

    let validateUser: () => Promise<Omit<UserEntity, 'password'>>;

    when('clica em “Fazer login no sistema”', async () => {
      validateUser = async () =>
        await authService.validateUser(userEmail, wrongUserPassword);
    });

    then('deve lançar uma UnauthorizedException', async () => {
      await expect(validateUser).rejects.toThrow(UnauthorizedException);
    });
  });

  test('Login com sucesso', ({ given, when, then, and }) => {
    let userEmail: string;
    let userPassword: string;
    let tokens: UserToken;

    given(/^que o usuário inseriu no campo email o valor "([^"]*)"$/, email => {
      userEmail = email;
    });

    given(/^o usuário inseriu no campo senha o valor "([^"]*)"$/, password => {
      userPassword = password;
    });

    given(
      /^existe um usuário no sistema com o email "([^"]*)" e com a senha "([^"]*)"$/,
      async (email, password) => {
        const user: UserEntity = {
          id: 1,
          name: 'User Test',
          email: email,
          password: await hashData(password),
          refreshToken: null,
          recoveryPasswordToken: '',
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: StatusEnum.ACTIVE,
          Media: null,
          mediaId: null,
          role: null,
        };

        jest.spyOn(userService, 'findByEmail').mockResolvedValue(user);
      },
    );

    when('clica em “Fazer login no sistema”', async () => {
      const loginDto: LoginDto = { email: userEmail, password: userPassword };
      tokens = await authService.login(loginDto);
    });

    then(
      'o usuário deve ser redirecionado para a página inicial da aplicação autenticado',
      () => {
        expect(tokens).toBeDefined();
      },
    );

    then('deve receber a token de acesso na resposta da requisição', () => {
      expect(tokens.accessToken).toBeDefined();
    });

    then('deve receber a token de refresh na resposta da requisição', () => {
      expect(tokens.refreshToken).toBeDefined();
    });
  });

  test('Solicitar recuperação de senha', ({ given, when, then }) => {
    let userEmail: string;

    given(
      /^que o usuário inseriu o valor "([^"]*)" no campo de email$/,
      email => {
        userEmail = email;
      },
    );

    given(
      /^no sistema existe um usuário com o campo email com o valor "([^"]*)"$/,
      async email => {
        const user: UserEntity = {
          id: 1,
          name: 'User Test',
          email: email,
          password: await hashData('random'),
          refreshToken: null,
          recoveryPasswordToken: '',
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: StatusEnum.ACTIVE,
          Media: null,
          mediaId: null,
          role: null,
        };

        jest.spyOn(userService, 'findByEmail').mockResolvedValue(user);
      },
    );

    when('usuário solicita a recuperação de senha', async () => {
      const dto = { email: userEmail };
      await authService.sendRecoveryPasswordEmail(dto);
    });

    then(
      'O usuário deve receber um email com um link para recuperação de senha',
      () => {
        expect(userService.findByEmail).toHaveBeenCalledWith(userEmail);
        expect(userRepositoryMock.updateAsync).toHaveBeenCalled();
        expect(authService.sendEmailRecovery).toHaveBeenCalled();
      },
    );
  });

  test('Trocar a senha com a token de recuperação válida', ({
    given,
    when,
    then,
    and,
  }) => {
    let recoveryPasswordToken: string;
    let newPassword: string;
    let userEmail: string;

    given(
      /^que o usuário tem uma token de recuperação com o valor "([^"]*)"$/,
      token => {
        recoveryPasswordToken = token;
      },
    );

    given(
      /^o sistema tem a token de recuperação com o valor "([^"]*)" atrelado ao email "([^"]*)"$/,
      async (token, email) => {
        userEmail = email;
        const currentUser: UserPayload = {
          id: 1,
          email: email,
          sub: email,
          name: 'cliente',
          role: RoleEnum.CUSTOMER,
          status: StatusEnum.ACTIVE,
          createdAt: new Date().toString(),
          iat: 0,
          exp: 0,
        };

        const userFindBy: UserEntity = {
          id: 1,
          name: 'administrador cliente',
          email: email,
          password: await hashData('mockPassword'),
          refreshToken: null,
          recoveryPasswordToken: await hashData(token),
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: StatusEnum.ACTIVE,
          Media: null,
          mediaId: null,
          role: RoleEnum.CUSTOMER,
        };

        jest
          .spyOn(authService, 'decodeEmailToken')
          .mockResolvedValue(currentUser);
        jest.spyOn(userService, 'findBy').mockResolvedValue(userFindBy);
        jest
          .spyOn(userRepositoryMock, 'updateUserPassword')
          .mockResolvedValue(Promise.resolve());
      },
    );

    given(/^o usuário enviou na senha o valor "([^"]*)"$/, password => {
      newPassword = password;
    });

    when('o usuário clica em “Trocar senha”', async () => {
      const dto: ChangePasswordByRecovery = {
        recoveryToken: recoveryPasswordToken,
        newPassword,
      };
      await authService.changePasswordByRecovery(dto);
    });

    then(
      'a senha do usuário atrelado a token de recuperação é modificada',
      () => {
        expect(authService.decodeEmailToken).toHaveBeenCalledWith(
          recoveryPasswordToken,
        );
        expect(userService.findBy).toHaveBeenCalledWith(
          { email: userEmail },
          anyObject(),
        );
        expect(userRepositoryMock.updateUserPassword).toHaveBeenCalledWith(
          1,
          anyString(),
        );
      },
    );
  });

  //--------------------------

  test('O usuário solicita a lista de pedidos', ({
    given,
    when,
    then,
    and,
  }) => {
    let userId: number;
    let email: string;
    let result: any;

    given(
      /^que existe um usuário com o ID "(.*)" e email "(.*)" com status "(.*)"$/,
      async (id, userEmail) => {
        userId = parseInt(id, 10);
        email = userEmail;
        const userToUpdate: UserEntity = {
          id: userId,
          name: 'cliente cadastro',
          email: userEmail,
          password: await hashData('mockValue'),
          refreshToken: null,
          recoveryPasswordToken: '',
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: null,
          status: StatusEnum.ACTIVE,
          Media: null,
          mediaId: null,
          role: RoleEnum.CUSTOMER,
        };

        userRepositoryMock.findByEmail.mockResolvedValue(userToUpdate);
        userRepositoryMock.exists.mockResolvedValue(Promise.resolve(true));
        userRepositoryMock.deleteAsync.mockResolvedValue(Promise.resolve());
        userRepositoryMock.findByIdAsync.mockResolvedValue(userToUpdate);
        userRepositoryMock.getOrders.mockResolvedValue([
          {
            id: 1,
            userId: userId,
            total: 100,
            status: OrderStatus.PROCESSING,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ] as any);
      },
    );

    when('o usuário solicita a lista de pedidos', async () => {
      result = await userService.fetchOrders(
        email,
        RoleEnum.CUSTOMER,
        email,
        userId,
      );
    });

    then('o sistema deve retornar sua lista de pedidos', () => {
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('userId', userId);
      expect(result[0]).toHaveProperty('total');
    });
  });

  //----------

  test('O administrador solicita a lista de pedidos de outro usuário', ({
    given,
    when,
    then,
    and,
  }) => {
    let userId: number;
    let email: string;
    let result: any;

    given('que existe um administrador no sistema', async () => {
      userRepositoryMock.exists({ role: RoleEnum.ADMIN });
    });

    and(
      /^que existe um usuário com o ID "(.*)" e email "(.*)" com status "(.*)"$/,
      async (id, userEmail) => {
        userId = parseInt(id, 10);
        email = userEmail;
        const userToUpdate: UserEntity = {
          id: userId,
          name: 'cliente cadastro',
          email: userEmail,
          password: await hashData('mockValue'),
          refreshToken: null,
          recoveryPasswordToken: '',
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: null,
          status: StatusEnum.ACTIVE,
          Media: null,
          mediaId: null,
          role: RoleEnum.CUSTOMER,
        };

        userRepositoryMock.findByEmail.mockResolvedValue(userToUpdate);
        userRepositoryMock.exists.mockResolvedValue(Promise.resolve(true));
        userRepositoryMock.deleteAsync.mockResolvedValue(Promise.resolve());
        userRepositoryMock.findByIdAsync.mockResolvedValue(userToUpdate);
        userRepositoryMock.getOrders.mockResolvedValue([
          {
            id: 1,
            userId: userId,
            total: 100,
            status: OrderStatus.PROCESSING,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ] as any);
      },
    );

    when(
      'o administrador solicita a lista de pedidos desse usuário',
      async () => {
        result = await userService.fetchOrders(
          'admin@gmail.com',
          RoleEnum.ADMIN,
          email,
          userId,
        );
      },
    );

    then('o sistema deve retornar a lista de pedidos do usuário', () => {
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('userId', userId);
      expect(result[0]).toHaveProperty('total');
    });
  });
});
