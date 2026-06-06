import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentStateDto } from './dto/update-appointment-state.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('api/v1/appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(private appointmentsService: AppointmentsService) {}

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.appointmentsService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.appointmentsService.findOne(id, user);
  }

  @Post()
  create(@Body() dto: CreateAppointmentDto, @CurrentUser() user: any) {
    return this.appointmentsService.create(dto, user);
  }

  @Patch(':id/state')
  updateState(
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentStateDto,
    @CurrentUser() user: any,
  ) {
    return this.appointmentsService.updateState(id, dto.state, user);
  }
}
