import { Controller, Get, Post, Patch, Query, Body, Param, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@Query('phone') phone: string) {
    if (!phone) {
      throw new NotFoundException('Phone number is required');
    }
    
    const user = await this.usersService.getProfile(phone);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Post()
  async create(@Body() body: { id: string; phone: string }) {
    if (!body.id || !body.phone) {
      throw new NotFoundException('ID and phone number are required');
    }
    
    // Check if user already exists by ID
    const existingUser = await this.usersService.findById(body.id);
    if (existingUser) {
      return existingUser;
    }
    
    // Create with the provided Supabase UID
    return this.usersService.createWithId(body.id, body.phone);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() data: { name?: string; isOnboarded?: boolean; currency?: string },
  ) {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.usersService.update(id, data);
  }
}
