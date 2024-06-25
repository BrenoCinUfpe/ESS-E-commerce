import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Cart, CartProduct, Product } from '@prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { DefaultFilter } from 'src/filters/DefaultFilter';
import { CrudType } from 'src/utils/base/ICrudTypeMap';
import { Paginated } from 'src/utils/base/IPaginated';
import { Paginator } from 'src/utils/paginator';

import { CartProductDto } from './dto/card-product-dto';
import { CartProductEntity } from './entity/cart-product.entity';
import { CartProductTypeMap } from './entity/cart-product.type.map';
import { CartEntity } from './entity/cart.entity';
import { CartTypeMap } from './entity/cart.type.map';

@Injectable()
export class CartRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getCart(data: CartTypeMap[CrudType.WHERE]): Promise<Cart | null> {
    const cart = await this.prisma.cart.findFirst({
      where: data,
      include: { products: true },
    });
    return cart;
  }

  async addToCart(data: CartProductDto): Promise<CartProductEntity> {
    try {
      const cartProduct = await this.prisma.cartProduct.create({
        data: {
          cartId: data.cartId,
          productId: data.productId,
          userId: data.userId,
          quantity: 1,
        },
      });
      return cartProduct;
    } catch (error) {
      throw new ConflictException('Unable to add product to cart');
    }
  }

  async removeFromCart(data: CartProductDto): Promise<any> {
    try {
      const cartProduct = await this.prisma.cartProduct.delete({
        where: {
          cartId_productId: {
            cartId: data.cartId,
            productId: data.productId,
          },
        },
      });
      return {ok: "true", message: "Item removido do carrinho com sucesso"};
    } catch (error) {
      throw new ConflictException('Unable to remove product from cart');
    }
  }

  async attCart(data: CartProductDto): Promise<any> {
    try {
      const cartProduct = await this.prisma.cartProduct.update({
        where: {
          cartId_productId: {
            cartId: data.cartId,
            productId: data.productId,
          },
        },
        data: {
          cartId: data.cartId,
          productId: data.productId,
          userId: data.userId,
          quantity: data.quantity > 0 ? data.quantity : 1,
        },
      });
      return cartProduct;
    } catch (error) {
      throw new ConflictException('Unable to update product quantity in cart');
    }
  }

  async cartExists(where: CartTypeMap[CrudType.WHERE]) {
    const cart = await this.prisma.cart.count({
      where,
    });

    return cart > 0;
  }

  async createCart(data: CartTypeMap[CrudType.CREATE]): Promise<CartEntity> {
    try {
      return await this.prisma.cart.create({
        data: {
          userId: data.userId,
          locked: false,
        },
      });
    } catch (error) {
      throw new NotFoundException('Esse carrinho já existe');
    }
  }
}
