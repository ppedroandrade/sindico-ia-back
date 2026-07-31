import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

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
      throw new ConflictException(
        'Já existe usuário com email, username ou CPF informado',
      );
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const created = await this.prisma.user.create({
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
    await Promise.all([
      this.notifications.createForUser(created.id, {
        type: 'success',
        title: 'Cadastro concluído',
        description: 'Sua conta no condomínio está pronta para uso.',
        module: 'Conta',
        link: '/conta',
      }),
      this.notifications.createForAdmins({
        type: 'info',
        title: 'Novo morador cadastrado',
        description: `${created.name} foi adicionado ao sistema.`,
        module: 'Usuários',
        link: '/usuarios',
      }),
    ]);
    return created;
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
      throw new ConflictException(
        'Já existe usuário com email, username ou CPF informado',
      );
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
    try {
      return await this.prisma.user.delete({
        where: { id },
        select: this.selectSafeUser,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new ConflictException(
          'Não é possível excluir este usuário pois existem registros vinculados a ele (reservas, pagamentos, ocorrências, etc). Desative o usuário em vez de excluí-lo.',
        );
      }
      throw error;
    }
  }

  private async ensureExists(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }
}
