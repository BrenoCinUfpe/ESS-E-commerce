import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiBody,
} from '@nestjs/swagger';
import { AuthenticatedUser } from 'src/auth/decorators/current-user.decorator';
import { UserPayload } from 'src/auth/models/UserPayload';

import { CartService } from './cart.service';
import { CartProductDto } from './dto/card-product-dto';
import { ReqCartProductDto } from './dto/req.cart-product.dto';
import { ReqCartDto } from './dto/req.cart.dto';
import { ResCartProductDto } from './dto/res.cart-product.dto';
import { ResCartDto } from './dto/res.cart.dto';

interface AddCartInterface {
  cartId: number;
  productId: number;
}

@ApiBearerAuth()
@Controller('cart')
@ApiTags('Cart')
export class CartController {
  private readonly logger = new Logger(CartController.name);

  constructor(private readonly cartService: CartService) {}

  @Post('create')
  @ApiOperation({ summary: 'Criar próprio carrinho caso não exista' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ReqCartDto,
  })
  async createCart(@AuthenticatedUser() currentUser: UserPayload) {
    this.logger.log('Creating a new cart');
    return this.cartService.createCart({
      userId: currentUser.id,
      locked: false,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Consultar carrinho' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ResCartDto,
  })
  async getCart(@AuthenticatedUser() currentUser: UserPayload) {
    this.logger.log('Getting cart');
    return this.cartService.getCart({ userId: currentUser.id });
  }

  @Post('add')
  @ApiOperation({ summary: 'Adicionar item ao carrinho' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ResCartProductDto,
  })
  @ApiBody({ type: ReqCartProductDto })
  async addCart(
    @Body() addCartDto: any,
    @AuthenticatedUser() currentUser: UserPayload,
  ) {
    this.logger.log('Adding to cart');
    return this.cartService.addToCart({
      productId: addCartDto.productId,
      userId: currentUser.id,
      cartId: addCartDto.cartId,
      quantity: 1,
    });
  }

  @Delete('remove')
  @ApiOperation({ summary: 'Remover item do carrinho' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ResCartProductDto,
  })
  @ApiBody({ type: ReqCartProductDto })
  async removeCart(
    @Body() remCartDto: any,
    @AuthenticatedUser() currentUser: UserPayload,
  ) {
    this.logger.log('Removing from cart');
    return this.cartService.removeFromCart({
      productId: remCartDto.productId,
      userId: currentUser.id,
      cartId: remCartDto.cartId,
      quantity: 0,
    });
  }

  @Put('update')
  @ApiOperation({ summary: 'Atualizar quantidade de um item no carrinho' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ResCartProductDto,
  })
  @ApiBody({ type: ReqCartProductDto })
  async attCart(
    @Body() attCartDto: any,
    @AuthenticatedUser() currentUser: UserPayload,
  ) {
    this.logger.log('Att cart');
    return this.cartService.attCart({
      productId: attCartDto.productId,
      userId: currentUser.id,
      cartId: attCartDto.cartId,
      quantity: attCartDto.quantity,
    });
  }
}
