import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthLoginDto, AuthRegisterDto } from '../dto/auth.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() authLoginDto: AuthLoginDto) {
    const user = await this.authService.validateUser(
      authLoginDto.username,
      authLoginDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() authRegisterDto: AuthRegisterDto) {
    return this.authService.register(
      authRegisterDto.name,
      authRegisterDto.username,
      authRegisterDto.password,
    );
  }
}
