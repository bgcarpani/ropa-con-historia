import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ProductState, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';

const VALID_TRANSITIONS: Partial<Record<ProductState, ProductState[]>> = {
  EN_VENTA: [ProductState.VENDIDO, ProductState.DEVUELTO, ProductState.CANCELADO],
  VENDIDO: [ProductState.PAGADO],
};

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  findAll(user: { id: string; role: Role }) {
    const where = user.role === Role.PROVEEDOR ? { supplierId: user.id } : {};
    return this.prisma.product.findMany({ where, include: { supplier: { select: { id: true, name: true } } } });
  }

  async findOne(id: string, user: { id: string; role: Role }) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { supplier: { select: { id: true, name: true } } },
    });
    if (!product) throw new NotFoundException('Product not found');
    if (user.role === Role.PROVEEDOR && product.supplierId !== user.id) {
      throw new ForbiddenException();
    }
    return product;
  }

  async create(dto: CreateProductDto) {
    const supplier = await this.prisma.user.findUnique({ where: { id: dto.supplierId } });
    if (!supplier) throw new NotFoundException('Supplier not found');
    return this.prisma.product.create({ data: dto });
  }

  async updateState(id: string, newState: ProductState) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');

    const allowed = VALID_TRANSITIONS[product.state] ?? [];
    if (!allowed.includes(newState)) {
      throw new BadRequestException(`Cannot transition from ${product.state} to ${newState}`);
    }

    const updated = await this.prisma.product.update({ where: { id }, data: { state: newState } });

    if (newState === ProductState.VENDIDO) {
      await this.createBalanceTransactions(product.supplierId, product.price, product.id);
    }

    return updated;
  }

  private async createBalanceTransactions(supplierId: string, price: number, productId: string) {
    const supplier = await this.prisma.user.findUnique({ where: { id: supplierId } });
    if (!supplier) return;

    const earnings = price * (supplier.creditPercentage + supplier.cashPercentage) / 100;
    const creditAmount = earnings * (supplier.creditPercentage / 100);
    const cashAmount = earnings * (supplier.cashPercentage / 100);

    await this.prisma.balanceTransaction.createMany({
      data: [
        { supplierId, amount: creditAmount, type: 'CREDIT', productId },
        { supplierId, amount: cashAmount, type: 'CASH', productId },
      ],
    });
  }

  async remove(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    return this.prisma.product.delete({ where: { id } });
  }
}
