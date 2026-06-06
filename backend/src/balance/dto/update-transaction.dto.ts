import { IsEnum } from 'class-validator';
import { TransactionState } from '@prisma/client';

export class UpdateTransactionDto {
  @IsEnum(TransactionState)
  state: TransactionState;
}
