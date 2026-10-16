import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RequestWithUser } from '../types/request-with-user.js';
import { RESTRICT_EMPLOYEE_KEY } from './restrict-employee.decorator.js';

/**
 * Trava de permissão de funcionário na API — espelho da matriz da UI.
 *
 * O guard só age quando o handler está marcado com `@RestrictEmployee()`;
 * rotas sem a metadata passam livremente (leitura de listas, baixa de
 * contagem, movimentações etc.). Funcionário restrito = `employeeId`
 * presente e papel diferente de 'admin'; dono e funcionário ADM não são
 * afetados. O `AuthGuard('jwt')` roda antes (aplicado na mesma
 * `@UseGuards`), então `req.user` sempre existe aqui.
 */
@Injectable()
export class EmployeeRestrictionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const restricted = this.reflector.getAllAndOverride<boolean>(
      RESTRICT_EMPLOYEE_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!restricted) return true;

    const { user } = context.switchToHttp().getRequest<RequestWithUser>();
    if (user?.employeeId && user?.role !== 'admin') {
      throw new ForbiddenException('Acesso restrito para funcionário');
    }
    return true;
  }
}
