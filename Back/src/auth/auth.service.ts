import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { JwtUser } from './user-request.interface';

const INVALID_CREDENTIALS_MESSAGE = 'Credenciais inválidas';

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

    // Sempre roda o bcrypt.compare, mesmo quando o usuário não existe, para não vazar
    // (por diferença de tempo de resposta) se um email/username está cadastrado ou não.
    const passwordHash =
      user?.password ??
      '$2b$10$y3ntRdS4ZBMeqJj7IshvAeNYDzr5Rv7KzA1YYdW5UP61DNX12D5fS';
    const isPasswordValid = await bcrypt.compare(password, passwordHash);

    if (!user || !isPasswordValid) {
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    }

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

  async me(user: JwtUser) {
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.userId },
    });
    if (!dbUser) throw new UnauthorizedException('Usuário não encontrado');
    return this.toSafeUser(dbUser);
  }

  async changePassword(
    user: JwtUser,
    currentPassword: string,
    newPassword: string,
  ) {
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.userId },
    });
    if (!dbUser || !dbUser.active)
      throw new UnauthorizedException('Usuário não encontrado');

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      dbUser.password,
    );
    if (!isPasswordValid)
      throw new UnauthorizedException('Senha atual incorreta');

    const password = await bcrypt.hash(newPassword, 10);
    const updated = await this.prisma.user.update({
      where: { id: user.userId },
      data: { password },
    });

    return this.toSafeUser(updated);
  }
}
