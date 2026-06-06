import { IsEnum } from 'class-validator';
import { AppointmentState } from '@prisma/client';

export class UpdateAppointmentStateDto {
  @IsEnum(AppointmentState)
  state: AppointmentState;
}
