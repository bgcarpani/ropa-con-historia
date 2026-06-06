import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { ReturnsService } from './returns.service';
import { CreateReturnDto } from './dto/create-return.dto';
import { UpdateReturnStateDto } from './dto/update-return-state.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('api/v1/returns')
@UseGuards(JwtAuthGuard)
export class ReturnsController {
  constructor(private returnsService: ReturnsService) {}

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.returnsService.findAll(user);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.PROVEEDOR)
  create(@Body() dto: CreateReturnDto, @CurrentUser() user: any) {
    return this.returnsService.create(dto, user);
  }

  @Patch(':id/state')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  updateState(@Param('id') id: string, @Body() dto: UpdateReturnStateDto) {
    return this.returnsService.updateState(id, dto.state, dto.adminNote);
  }
}
