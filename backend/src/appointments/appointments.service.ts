import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { AppointmentState, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

const SUPPLIER_CANCEL_ALLOWED: AppointmentState[] = [AppointmentState.PENDIENTE];
const ADMIN_TRANSITIONS: Partial<Record<AppointmentState, AppointmentState[]>> = {
  PENDIENTE: [AppointmentState.CONFIRMADO, AppointmentState.CANCELADO],
  CONFIRMADO: [AppointmentState.COMPLETADO, AppointmentState.CANCELADO],
};

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  findAll(user: { id: string; role: Role }) {
    const where = user.role === Role.PROVEEDOR ? { supplierId: user.id } : {};
    return this.prisma.appointment.findMany({
      where,
      include: { supplier: { select: { id: true, name: true } } },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async findOne(id: string, user: { id: string; role: Role }) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: { supplier: { select: { id: true, name: true } } },
    });
    if (!appointment) throw new NotFoundException('Appointment not found');
    if (user.role === Role.PROVEEDOR && appointment.supplierId !== user.id) {
      throw new ForbiddenException();
    }
    return appointment;
  }

  create(dto: CreateAppointmentDto, user: { id: string; role: Role }) {
    const supplierId = user.role === Role.PROVEEDOR ? user.id : dto.supplierId;
    if (!supplierId) throw new BadRequestException('supplierId is required');
    return this.prisma.appointment.create({
      data: {
        supplierId,
        type: dto.type,
        scheduledAt: new Date(dto.scheduledAt),
        notes: dto.notes,
      },
    });
  }

  async updateState(id: string, newState: AppointmentState, user: { id: string; role: Role }) {
    const appointment = await this.prisma.appointment.findUnique({ where: { id } });
    if (!appointment) throw new NotFoundException('Appointment not found');

    if (user.role === Role.PROVEEDOR) {
      if (appointment.supplierId !== user.id) throw new ForbiddenException();
      if (newState !== AppointmentState.CANCELADO || !SUPPLIER_CANCEL_ALLOWED.includes(appointment.state)) {
        throw new BadRequestException('Suppliers can only cancel pending appointments');
      }
    } else {
      const allowed = ADMIN_TRANSITIONS[appointment.state] ?? [];
      if (!allowed.includes(newState)) {
        throw new BadRequestException(`Cannot transition from ${appointment.state} to ${newState}`);
      }
    }

    return this.prisma.appointment.update({ where: { id }, data: { state: newState } });
  }
}
