import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { SalesModule } from './sales/sales.module';
import { BalanceModule } from './balance/balance.module';
import { ReturnsModule } from './returns/returns.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    AppointmentsModule,
    SalesModule,
    BalanceModule,
    ReturnsModule,
  ],
})
export class AppModule {}
