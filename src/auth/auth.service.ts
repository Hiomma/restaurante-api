import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service.js';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(name: string, username: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.usersService.create({
      name,
      username,
      password: hashedPassword,
    });
    const payload = { username: user.username, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
