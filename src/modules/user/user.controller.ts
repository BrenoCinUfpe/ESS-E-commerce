import { Controller } from '@nestjs/common';
import {
  Body,
  Delete,
  Get,
  Param,
  Query,
  Res,
  HttpStatus,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RoleEnum } from '@prisma/client';
import { Response } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { AuthenticatedUser } from 'src/auth/decorators/current-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserPayload } from 'src/auth/models/UserPayload';
import { DefaultFilter } from 'src/filters/DefaultFilter';
import {
  ApiExceptionResponse,
  ApiOkResponsePaginated,
} from 'src/utils/swagger-schemas/SwaggerSchema';

import { UpdateUserPersonalData } from './dto/request/update.personal.data.dto';
import { UpdateUserPassword } from './dto/request/update.personal.password.dto';
import { UserPaginationResponse } from './dto/response/user.pagination.response';
import { UserTypeMap } from './entity/user.type.map';
import { UserService } from './user.service';

@ApiBearerAuth()
@Controller('user')
@ApiTags('User')
export class UserController {
  constructor(
    protected readonly service: UserService,
    protected readonly authService: AuthService,
  ) {}

  @ApiOperation({ summary: 'Get filtered user' })
  @ApiOkResponsePaginated(UserPaginationResponse)
  @ApiExceptionResponse()
  @Get()
  @Roles(RoleEnum.ADMIN)
  async getFilteredAsync(
    @Res() response: Response,
    @Query() filter: DefaultFilter<UserTypeMap>,
  ) {
    const filteredData = await this.service.findFilteredAsync(filter);

    return response.status(HttpStatus.OK).json(filteredData);
  }

  @ApiOperation({ summary: 'Delete user' })
  @ApiParam({
    name: 'id',
    type: Number,
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @ApiExceptionResponse()
  @Delete('/:id')
  @Roles(RoleEnum.ADMIN)
  protected async deleteAsync(
    @Res() response: Response,
    @Param('id') id: number,
  ) {
    await this.service.deleteAsync(id);

    return response.status(HttpStatus.OK).json(id);
  }

  @ApiOperation({ summary: 'Change personal password' })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @ApiExceptionResponse()
  @Patch('personal/password')
  protected async changePersonalPassword(
    @AuthenticatedUser() currentUser: UserPayload,
    @Body() body: UpdateUserPassword,
    @Res() response: Response,
  ) {
    await this.service.updateUserPassword(body, currentUser);

    return response.status(HttpStatus.OK).send();
  }

  @ApiOperation({ summary: 'Change personal data' })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @ApiExceptionResponse()
  @Patch('personal/data')
  protected async changePersonalData(
    @AuthenticatedUser() currentUser: UserPayload,
    @Body() body: UpdateUserPersonalData,
    @Res() response: Response,
  ) {
    await this.service.updateUserPersonalData(body, currentUser);

    return response.status(HttpStatus.OK).send();
  }

  @ApiOperation({ summary: 'Inactive my account' })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @ApiExceptionResponse()
  @Delete('personal')
  protected async inactiveMyAccount(
    @AuthenticatedUser() currentUser: UserPayload,
    @Res() response: Response,
  ) {
    await this.service.deleteAsync(currentUser.id);

    return response.status(HttpStatus.OK).send();
  }

  @Get('orders')
  @ApiOperation({ summary: 'Listar pedidos de um usuário' })
  async searchOrders(
    @AuthenticatedUser() currentUser: UserPayload,
    @Query('targetEmail') targetEmail: string,
  ) {
    return this.service.fetchOrders(
      currentUser.email,
      currentUser.role,
      targetEmail,
      currentUser.id,
    );
  }
}
