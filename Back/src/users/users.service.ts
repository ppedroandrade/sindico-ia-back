import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
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

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return this.prisma.user.delete({
      where: { id },
      select: this.selectSafeUser,
    });
  }
}
