import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AdminUserService } from './admin-users.service';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { BasicAuthGuard } from './guards/basic-auth.guard';

@UseGuards(BasicAuthGuard)
@Controller('admin-users')
export class AdminUserController {
  constructor(private readonly adminUsersService: AdminUserService) {}

  @Post()
  async create(@Body() createAdminUserDto: CreateAdminUserDto) {
    return await this.adminUsersService.create(createAdminUserDto);
  }
}
