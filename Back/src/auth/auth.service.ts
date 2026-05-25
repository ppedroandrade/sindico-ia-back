import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Role, User } from '@prisma/client';
import { JwtUser } from './user-request.interface';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(login: string, password: string): Promise<User> {
    const user = await this.prisma.user.findFirst({
      where: {
        active: true,
        OR: [{ email: login }, { username: login }],
      },
    });
    if (!user) throw new UnauthorizedException('Usuário não encontrado');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Senha incorreta');

    return user;
  }

  private toSafeUser(user: User) {
    const { password, ...safeUser } = user;
    void password;
    return safeUser;
  }

  login(user: User) {
    const payload = { email: user.email, userId: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: this.toSafeUser(user),
    };
  }

  async register(data: {
    name: string;
    email: string;
    password: string;
    role: Role;
  }) {
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) throw new ConflictException('Email já cadastrado');

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role,
      },
    });
    return this.toSafeUser(user);
  }

  async me(user: JwtUser) {
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.userId },
    });
    if (!dbUser) throw new UnauthorizedException('Usuário não encontrado');
    return this.toSafeUser(dbUser);
  }

  async changePassword(user: JwtUser, currentPassword: string, newPassword: string) {
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.userId },
    });
    if (!dbUser || !dbUser.active) throw new UnauthorizedException('Usuário não encontrado');

    const isPasswordValid = await bcrypt.compare(currentPassword, dbUser.password);
    if (!isPasswordValid) throw new UnauthorizedException('Senha atual incorreta');

    const password = await bcrypt.hash(newPassword, 10);
    const updated = await this.prisma.user.update({
      where: { id: user.userId },
      data: { password },
    });

    return this.toSafeUser(updated);
  }
}
