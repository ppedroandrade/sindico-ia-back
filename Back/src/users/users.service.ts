import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private selectSafeUser = {
    id: true,
    name: true,
    email: true,
    username: true,
    role: true,
    cpf: true,
    apartment: true,
    parkingSpaces: true,
    active: true,
    createdAt: true,
    updatedAt: true,
  };

  async create(data: CreateUserDto) {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          ...(data.username ? [{ username: data.username }] : []),
          ...(data.cpf ? [{ cpf: data.cpf }] : []),
        ],
      },
    });

    if (existing) {
      throw new ConflictException('Já existe usuário com email, username ou CPF informado');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        username: data.username || null,
        password: hashedPassword,
        role: data.role,
        cpf: data.cpf || null,
        apartment: data.apartment || null,
        parkingSpaces: data.parkingSpaces?.filter(Boolean) ?? [],
      },
      select: this.selectSafeUser,
    });
  }

  findAll() {
    return this.prisma.user.findMany({
      select: this.selectSafeUser,
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, data: UpdateUserDto) {
    await this.ensureExists(id);

    const uniqueChecks = [
      ...(data.email ? [{ email: data.email }] : []),
      ...(data.username ? [{ username: data.username }] : []),
      ...(data.cpf ? [{ cpf: data.cpf }] : []),
    ];

    const duplicate = uniqueChecks.length
      ? await this.prisma.user.findFirst({
          where: {
            id: { not: id },
            OR: uniqueChecks,
          },
        })
      : null;

    if (duplicate) {
      throw new ConflictException('Já existe usuário com email, username ou CPF informado');
    }

    const password = data.newPassword
      ? await bcrypt.hash(data.newPassword, 10)
      : data.password
        ? await bcrypt.hash(data.password, 10)
        : undefined;

    return this.prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        username: data.username === '' ? null : data.username,
        password,
        role: data.role,
        cpf: data.cpf === '' ? null : data.cpf,
        apartment: data.apartment === '' ? null : data.apartment,
        parkingSpaces: data.parkingSpaces?.filter(Boolean),
        active: data.active,
      },
      select: this.selectSafeUser,
    });
  }

  async setActive(id: string, active: boolean) {
    await this.ensureExists(id);
    return this.prisma.user.update({
      where: { id },
      data: { active },
      select: this.selectSafeUser,
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.user.delete({
      where: { id },
      select: this.selectSafeUser,
    });
  }

  private async ensureExists(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }
}
