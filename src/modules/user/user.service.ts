import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { Prisma, RoleEnum, StatusEnum } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UserRegisteredResponse } from 'src/auth/dto/response/UserToken';
import { UserPayload } from 'src/auth/models/UserPayload';
import { DefaultFilter } from 'src/filters/DefaultFilter';
import { CrudType } from 'src/utils/base/ICrudTypeMap';
import { Paginated } from 'src/utils/base/IPaginated';
import { isDevelopmentEnviroment } from 'src/utils/environment';
import { guardUser } from 'src/utils/guards/guard-user';
import { hashData } from 'src/utils/hash';
import {
  MessagesHelperKey,
  getMessage,
  setMessage,
} from 'src/utils/messages.helper';
import { handleError } from 'src/utils/treat.exceptions';

import { UpdateUserPersonalData } from './dto/request/update.personal.data.dto';
import { UpdateUserPassword } from './dto/request/update.personal.password.dto';
import { UserPaginationResponse } from './dto/response/user.pagination.response';
import { TUserPagination } from './dto/type/user.pagination';
import { UserEntity } from './entity/user.entity';
import { UserTypeMap } from './entity/user.type.map';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  private logger = new Logger(UserService.name);

  constructor(
    protected readonly userRepository: UserRepository,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  async createAsync(data: UserTypeMap[CrudType.CREATE]): Promise<UserEntity> {
    this.logger.log(`Create user`);

    try {
      if ((await this.exists({ email: data.email.trim() })) === true) {
        this.logger.debug(`Email already exists`);
        throw new ConflictException(
          getMessage(MessagesHelperKey.EMAIL_ALREADY_EXISTS),
        );
      }

      return await this.userRepository.createAsync(data);
    } catch (error) {
      this.logger.debug(`Error on create user ${error}`);
      handleError(error);
    }
  }

  async deleteAsync(id: number): Promise<void> {
    this.logger.log(`Delete user`);

    if (id == null) {
      this.logger.debug(`Id is required`);
      throw new BadRequestException(getMessage(MessagesHelperKey.ID_REQUIRED));
    }

    try {
      if ((await this.exists({ id })) === false) {
        this.logger.debug(`User not found`);
        throw new NotFoundException(
          setMessage(getMessage(MessagesHelperKey.USER_NOT_FOUND), id),
        );
      }

      const userToBeDeleted = await this.userRepository.findByIdAsync(id);

      if (
        !userToBeDeleted ||
        userToBeDeleted.deletedAt != null ||
        userToBeDeleted.status === StatusEnum.INACTIVE
      ) {
        throw new ForbiddenException(
          setMessage(getMessage(MessagesHelperKey.USER_INACTIVE), id),
        );
      }

      if (userToBeDeleted.role === RoleEnum.ADMIN) {
        throw new ForbiddenException(
          setMessage(getMessage(MessagesHelperKey.USER_ADMIN_DELETE), id),
        );
      }

      await this.userRepository.deleteAsync(id);
    } catch (error) {
      this.logger.debug(`Error on delete ${error}`);

      handleError(error);
    }
  }

  async exists(where: UserTypeMap[CrudType.WHERE]): Promise<boolean> {
    try {
      return await this.userRepository.exists(where);
    } catch (error) {
      handleError(error);
    }
  }

  async findBy(
    where: UserTypeMap[CrudType.WHERE],
    select: UserTypeMap[CrudType.SELECT],
    optionals?: {
      orderBy?: UserTypeMap[CrudType.ORDER_BY];
    },
  ): Promise<Partial<UserEntity>> {
    try {
      this.logger.log(`Find by`);

      if ((await this.exists(where)) === false) {
        this.logger.debug(`User not found`);
        throw new NotFoundException(
          setMessage(getMessage(MessagesHelperKey.USER_NOT_FOUND), ''),
        );
      }

      const data = await this.userRepository.findBy(
        where,
        select,
        optionals?.orderBy,
      );

      return data;
    } catch (error) {
      handleError(error);
    }
  }

  async findFilteredAsync(
    filter: DefaultFilter<UserTypeMap>,
  ): Promise<Paginated<Partial<UserPaginationResponse>>> {
    try {
      this.logger.log(`Find filtered async`);

      const userFiltered = await this.userRepository.findFilteredAsync(filter);

      const userFilteredDataMapped = this.mapper.mapArray(
        userFiltered.data,
        TUserPagination,
        UserPaginationResponse,
      );

      return {
        ...userFiltered,
        data: userFilteredDataMapped,
      };
    } catch (error) {
      handleError(error);
    }
  }

  async findByEmail(email: string) {
    try {
      this.logger.log(`Find by email`);

      const user = await this.userRepository.findByEmail(email);

      return user;
    } catch (error) {
      handleError(error);
    }
  }

  async updateUserPassword(
    body: UpdateUserPassword,
    currentUser: UserPayload,
  ): Promise<void> {
    this.logger.debug(`Update user password`);

    if (body.actualPassword === body.newPassword) {
      throw new BadRequestException(
        getMessage(MessagesHelperKey.PASSWORD_ARE_EQUALS),
      );
    }

    const user = await this.userRepository.findByIdAsync(currentUser.id);

    try {
      guardUser(
        {
          deletedAt: user?.deletedAt,
          email: user?.email,
          status: user?.status,
        },
        this.logger,
      );

      const isPasswordValid = await bcrypt.compare(
        body.actualPassword,
        user.password,
      );

      if (!isPasswordValid) {
        this.logger.debug(`Password validation is invalid`);

        throw new BadRequestException(
          getMessage(MessagesHelperKey.PASSWORD_UNMATCH),
        );
      }

      if (isDevelopmentEnviroment()) {
        this.logger.debug(`[DEV] User password : ${body.newPassword}`);
      }

      const hash = await hashData(body.newPassword);
      this.logger.debug(`Password hashed`);

      await this.userRepository.updateUserPassword(currentUser.id, hash);

      this.logger.debug(`User password updated`);
    } catch (error) {
      handleError(error);
    }
  }

  async updateUserPersonalData(
    body: UpdateUserPersonalData,
    currentUser: UserPayload,
  ) {
    this.logger.debug(`Update user personal data`);

    if (!body?.name && !body?.image) {
      this.logger.debug(`No data to update, returning without changes`);

      return;
    }

    const user = await this.userRepository.findByIdAsync(currentUser?.id);

    guardUser(
      {
        deletedAt: user?.deletedAt,
        email: user?.email,
        status: user?.status,
      },
      this.logger,
    );

    try {
      const userUpdateInput: Prisma.UserUpdateInput = {};

      if (body.name) userUpdateInput.name = body.name;

      if (body.image) {
        this.logger.debug(`Has image`);

        userUpdateInput.Media = {
          upsert: {
            where: {
              id: user.mediaId || undefined,
            },
            create: {
              url: body.image,
            },
            update: {
              url: body.image,
            },
          },
        };
      }

      await this.userRepository.updateAsync(user.id, userUpdateInput);

      this.logger.debug(`User personal data updated`);
    } catch (error) {
      handleError(error);
    }
  }

  async fetchOrders(
    email: string,
    role: string,
    targetEmail: string,
    userId: number,
  ) {
    const targetUser = await this.userRepository.findByEmail(targetEmail);

    if (email == targetEmail || role === RoleEnum.ADMIN) {
      return await this.userRepository.getOrders(targetUser.id);
    } else {
      return [];
    }
  }
}
