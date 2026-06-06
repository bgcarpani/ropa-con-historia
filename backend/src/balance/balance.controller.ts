import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { BalanceService } from './balance.service';
import { AdjustBalanceDto } from './dto/adjust-balance.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('api/v1/balance')
@UseGuards(JwtAuthGuard)
export class BalanceController {
  constructor(private balanceService: BalanceService) {}

  @Get(':supplierId')
  getSummary(@Param('supplierId') supplierId: string, @CurrentUser() user: any) {
    return this.balanceService.getSummary(supplierId, user);
  }

  @Get(':supplierId/history')
  getHistory(@Param('supplierId') supplierId: string, @CurrentUser() user: any) {
    return this.balanceService.getHistory(supplierId, user);
  }

  @Patch('transactions/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  updateTransaction(@Param('id') id: string, @Body() dto: UpdateTransactionDto) {
    return this.balanceService.updateTransaction(id, dto.state);
  }

  @Post(':supplierId/adjust')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  adjust(@Param('supplierId') supplierId: string, @Body() dto: AdjustBalanceDto) {
    return this.balanceService.adjust(supplierId, dto);
  }
}
