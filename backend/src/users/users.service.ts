import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true, name: true, email: true, role: true, phone: true,
        creditPercentage: true, cashPercentage: true, active: true, createdAt: true,
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, email: true, role: true, phone: true,
        creditPercentage: true, cashPercentage: true, active: true, createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already in use');

    const creditPercentage = dto.creditPercentage ?? 60;
    const cashPercentage = dto.cashPercentage ?? 40;
    if (creditPercentage + cashPercentage !== 100) {
      throw new BadRequestException('creditPercentage + cashPercentage must equal 100');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash,
        role: dto.role,
        phone: dto.phone,
        creditPercentage,
        cashPercentage,
      },
      select: {
        id: true, name: true, email: true, role: true, phone: true,
        creditPercentage: true, cashPercentage: true, active: true, createdAt: true,
      },
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);

    if (dto.creditPercentage !== undefined || dto.cashPercentage !== undefined) {
      const user = await this.prisma.user.findUnique({ where: { id } });
      const credit = dto.creditPercentage ?? user!.creditPercentage;
      const cash = dto.cashPercentage ?? user!.cashPercentage;
      if (credit + cash !== 100) {
        throw new BadRequestException('creditPercentage + cashPercentage must equal 100');
      }
    }

    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: {
        id: true, name: true, email: true, role: true, phone: true,
        creditPercentage: true, cashPercentage: true, active: true, createdAt: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.user.delete({ where: { id } });
  }
}
