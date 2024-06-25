import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Cart } from '@prisma/client';
import { CrudType } from 'src/utils/base/ICrudTypeMap';
import {
  MessagesHelperKey,
  getMessage,
  setMessage,
} from 'src/utils/messages.helper';
import { handleError } from 'src/utils/treat.exceptions';

import { CartRepository } from './cart.repository';
import { CartProductDto } from './dto/card-product-dto';
import { CartProductEntity } from './entity/cart-product.entity';
import { CartProductTypeMap } from './entity/cart-product.type.map';
import { CartEntity } from './entity/cart.entity';
import { CartTypeMap } from './entity/cart.type.map';

@Injectable()
export class CartService {
  private logger = new Logger(CartService.name);

  constructor(
    protected readonly cartRepository: CartRepository,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  async createCart(data: CartTypeMap[CrudType.CREATE]): Promise<any> {
    this.logger.log(`Create Cart`);
    try {
      if (
        (await this.cartRepository.cartExists({ id: data.userId })) === true
      ) {
        this.logger.debug(`Cart already exists for that user`);
        throw new ConflictException(
          getMessage(MessagesHelperKey.CART_ALREADY_EXISTS),
        );
      }
      return await this.cartRepository.createCart(data);
    } catch (error) {
      handleError(error);
      throw new ConflictException(`Error on creating cart. Already exists.`);
    }
  }

  async getCart(data: CartTypeMap[CrudType.WHERE]): Promise<any> {
    try {
      const userWithCart = await this.cartRepository.getCart(data);

      if (userWithCart.userId == data.userId) {
        return userWithCart;
      } else {
        throw new NotFoundException('Fetch not authorize the specified cart');
      }
    } catch (error) {
      throw new NotFoundException('Cart not found or not authorized');
    }
  }

  async addToCart(data: CartProductDto): Promise<any> {
    try {
      const correctCart = await this.cartRepository.getCart({
        userId: data.userId,
      });

      if (correctCart.id == data.cartId) {
        try {
          const userWithCart = await this.cartRepository.addToCart(data);
          return userWithCart;
        } catch (error) {
          throw new NotFoundException(
            'An error ocurred while updating the cart',
          );
        }
      } else {
        throw new NotFoundException(
          'Changes not authorized the specified cart',
        );
      }
    } catch (error) {
      throw new NotFoundException('Cart not found or not authorized');
    }
  }

  async removeFromCart(data: CartProductDto): Promise<any> {
    try {
      const correctCart = await this.cartRepository.getCart({
        userId: data.userId,
      });

      if (correctCart.id == data.cartId) {
        try {
          const userWithCart = await this.cartRepository.removeFromCart(data);
          return userWithCart;
        } catch (error) {
          throw new NotFoundException(
            'An error ocurred while updating the cart',
          );
        }
      } else {
        throw new NotFoundException(
          'Changes not authorized the specified cart',
        );
      }
    } catch (error) {
      throw new NotFoundException('Cart not found or not authorized');
    }
  }

  async attCart(data: CartProductDto): Promise<any> {
    try {
      const correctCart = await this.cartRepository.getCart({
        userId: data.userId,
      });

      if (correctCart.id == data.cartId) {
        try {
          const userWithCart = await this.cartRepository.attCart(data);
          return userWithCart;
        } catch (error) {
          throw new NotFoundException(
            'An error ocurred while updating the cart',
          );
        }
      } else {
        throw new NotFoundException(
          'Changes not authorized the specified cart',
        );
      }
    } catch (error) {
      throw new NotFoundException('Cart not found or not authorized');
    }
  }
}
