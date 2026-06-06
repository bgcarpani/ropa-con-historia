import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { ProductState, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  findAll(user: { id: string; role: Role }) {
    if (user.role === Role.PROVEEDOR) {
      return this.prisma.sale.findMany({
        where: { products: { some: { supplierId: user.id } } },
        include: { products: true, admin: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      });
    }
    return this.prisma.sale.findMany({
      include: { products: { include: { supplier: { select: { id: true, name: true } } } }, admin: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, user: { id: string; role: Role }) {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: {
        products: { include: { supplier: { select: { id: true, name: true } } } },
        admin: { select: { id: true, name: true } },
      },
    });
    if (!sale) throw new NotFoundException('Sale not found');
    if (user.role === Role.PROVEEDOR && !sale.products.some(p => p.supplierId === user.id)) {
      throw new ForbiddenException();
    }
    return sale;
  }

  async create(dto: CreateSaleDto, adminId: string) {
    const products = await this.prisma.product.findMany({
      where: { id: { in: dto.productIds } },
    });

    if (products.length !== dto.productIds.length) {
      throw new NotFoundException('One or more products not found');
    }

    const notForSale = products.filter(p => p.state !== ProductState.EN_VENTA);
    if (notForSale.length > 0) {
      throw new BadRequestException('All products must be EN_VENTA to create a sale');
    }

    const sale = await this.prisma.sale.create({
      data: {
        adminId,
        products: { connect: dto.productIds.map(id => ({ id })) },
      },
      include: { products: true },
    });

    await this.prisma.product.updateMany({
      where: { id: { in: dto.productIds } },
      data: { state: ProductState.VENDIDO },
    });

    for (const product of products) {
      const supplier = await this.prisma.user.findUnique({ where: { id: product.supplierId } });
      if (!supplier) continue;
      const earnings = product.price;
      const creditAmount = earnings * (supplier.creditPercentage / 100);
      const cashAmount = earnings * (supplier.cashPercentage / 100);
      await this.prisma.balanceTransaction.createMany({
        data: [
          { supplierId: product.supplierId, amount: creditAmount, type: 'CREDIT', productId: product.id },
          { supplierId: product.supplierId, amount: cashAmount, type: 'CASH', productId: product.id },
        ],
      });
    }

    return sale;
  }
}
