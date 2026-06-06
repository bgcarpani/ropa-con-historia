import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { ProductState, ReturnState, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReturnDto } from './dto/create-return.dto';

@Injectable()
export class ReturnsService {
  constructor(private prisma: PrismaService) {}

  findAll(user: { id: string; role: Role }) {
    const where = user.role === Role.PROVEEDOR ? { supplierId: user.id } : {};
    return this.prisma.returnRequest.findMany({
      where,
      include: {
        product: { select: { id: true, name: true, price: true } },
        supplier: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateReturnDto, user: { id: string }) {
    const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException('Product not found');
    if (product.supplierId !== user.id) throw new ForbiddenException();
    if (product.state !== ProductState.EN_VENTA) {
      throw new BadRequestException('Product must be EN_VENTA to request a return');
    }

    const existing = await this.prisma.returnRequest.findUnique({ where: { productId: dto.productId } });
    if (existing) throw new ConflictException('A return request already exists for this product');

    return this.prisma.returnRequest.create({
      data: { supplierId: user.id, productId: dto.productId, reason: dto.reason },
    });
  }

  async updateState(id: string, state: ReturnState, adminNote?: string) {
    const request = await this.prisma.returnRequest.findUnique({
      where: { id },
      include: { product: true },
    });
    if (!request) throw new NotFoundException('Return request not found');
    if (request.state !== ReturnState.PENDIENTE) {
      throw new BadRequestException('Return request already resolved');
    }

    if (state === ReturnState.APROBADA) {
      await this.prisma.product.update({
        where: { id: request.productId },
        data: { state: ProductState.DEVUELTO },
      });
    }

    return this.prisma.returnRequest.update({
      where: { id },
      data: { state, adminNote },
    });
  }
}
