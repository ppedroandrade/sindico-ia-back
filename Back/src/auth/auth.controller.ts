import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import * as userRequestInterface from './user-request.interface'; // importa aqui

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.authService.validateUser(body.email, body.password);
    const jwtUser = { userId: user.id, email: user.email, role: user.role };
    return this.authService.login(jwtUser);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: userRequestInterface.AuthenticatedRequest) {
    return req.user;
  }
}
