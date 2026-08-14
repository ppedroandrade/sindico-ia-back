import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
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
    // Não filtra por `active` aqui: precisamos comparar a senha antes de decidir
    // qual erro mostrar. Só revelamos "conta desativada" depois de confirmar que a
    // senha está correta, então isso nunca ajuda alguém a descobrir se um email
    // existe ou está cadastrado (só quem já prova saber a senha vê essa mensagem).
    const user = await this.prisma.user.findFirst({
      where: {
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

    if (!user.active) {
      throw new ForbiddenException(
        'Esta conta foi desativada. Entre em contato com o síndico.',
      );
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
