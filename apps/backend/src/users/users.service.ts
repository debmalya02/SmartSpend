import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByPhone(phone: string) {
    return this.prisma.user.findUnique({
      where: { phone },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async create(phone: string) {
    return this.prisma.user.create({
      data: {
        phone,
        isOnboarded: false,
      },
    });
  }

  async createWithId(id: string, phone: string) {
    return this.prisma.user.create({
      data: {
        id,  // Use Supabase UID as the primary key
        phone,
        isOnboarded: false,
      },
    });
  }

  async update(id: string, data: { name?: string; isOnboarded?: boolean; currency?: string }) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async getProfile(phone: string) {
    const user = await this.prisma.user.findUnique({
      where: { phone },
      select: {
        id: true,
        phone: true,
        name: true,
        isOnboarded: true,
        currency: true,
      },
    });
    return user;
  }
}
