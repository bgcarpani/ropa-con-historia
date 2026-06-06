import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AdjustBalanceDto } from './dto/adjust-balance.dto';

@Injectable()
export class BalanceService {
  constructor(private prisma: PrismaService) {}

  private async assertAccess(supplierId: string, user: { id: string; role: Role }) {
    if (user.role === Role.PROVEEDOR && user.id !== supplierId) {
      throw new ForbiddenException();
    }
    const supplier = await this.prisma.user.findUnique({ where: { id: supplierId } });
    if (!supplier) throw new NotFoundException('Supplier not found');
  }

  async getSummary(supplierId: string, user: { id: string; role: Role }) {
    await this.assertAccess(supplierId, user);
    const transactions = await this.prisma.balanceTransaction.findMany({
      where: { supplierId, state: 'PENDIENTE' },
    });

    const credit = transactions.filter(t => t.type === 'CREDIT').reduce((s, t) => s + t.amount, 0);
    const cash = transactions.filter(t => t.type === 'CASH').reduce((s, t) => s + t.amount, 0);

    return { supplierId, pendingCredit: credit, pendingCash: cash, total: credit + cash };
  }

  async getHistory(supplierId: string, user: { id: string; role: Role }) {
    await this.assertAccess(supplierId, user);
    return this.prisma.balanceTransaction.findMany({
      where: { supplierId },
      include: { product: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateTransaction(id: string, state: any) {
    const transaction = await this.prisma.balanceTransaction.findUnique({ where: { id } });
    if (!transaction) throw new NotFoundException('Transaction not found');
    return this.prisma.balanceTransaction.update({ where: { id }, data: { state } });
  }

  async adjust(supplierId: string, dto: AdjustBalanceDto) {
    const supplier = await this.prisma.user.findUnique({ where: { id: supplierId } });
    if (!supplier) throw new NotFoundException('Supplier not found');
    return this.prisma.balanceTransaction.create({
      data: {
        supplierId,
        amount: dto.amount,
        type: dto.type,
        note: dto.note,
      },
    });
  }
}
