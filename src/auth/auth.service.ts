import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service.js';
import { EmployeesService } from '../employees/employees.service.js';

interface AuthenticatedIdentity {
  _id: string;
  username: string;
  name: string;
  role: string;
  ownerId: string;
  employeeId?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private employeesService: EmployeesService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    username: string,
    password: string,
  ): Promise<AuthenticatedIdentity | null> {
    const user = await this.usersService.findByUsername(username);
    if (user && (await bcrypt.compare(password, user.password))) {
      return {
        _id: user._id.toString(),
        username: user.username,
        name: user.name,
        role: user.role || 'admin',
        ownerId: user._id.toString(),
      };
    }

    const employees = await this.employeesService.findByUsername(username);
    for (const employee of employees) {
      if (!employee.active) continue;
      const matches = await bcrypt.compare(password, employee.passwordHash);
      if (matches) {
        return {
          _id: employee._id.toString(),
          username: employee.username,
          name: employee.name,
          role: employee.role || 'employee',
          ownerId: employee.owner.toString(),
          employeeId: employee._id.toString(),
        };
      }
    }

    return null;
  }

  async login(identity: AuthenticatedIdentity) {
    const payload = {
      username: identity.username,
      sub: identity.ownerId,
      role: identity.role,
      employeeId: identity.employeeId,
    };
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
    return this.login({
      _id: user._id.toString(),
      username: user.username,
      name: user.name,
      role: user.role || 'admin',
      ownerId: user._id.toString(),
    });
  }
}
