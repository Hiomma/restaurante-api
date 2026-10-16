import { SetMetadata } from '@nestjs/common';

/** Chave de metadata que marca um handler como proibido a funcionário restrito. */
export const RESTRICT_EMPLOYEE_KEY = 'restrictEmployee';

/**
 * Marca um handler como restrito a dono/funcionário ADM (espelho da matriz
 * de permissões da UI). Um funcionário logado — `employeeId` presente e
 * papel diferente de 'admin' — recebe 403 ao atingir o handler; dono e
 * funcionário ADM não são afetados. Só tem efeito em rotas cujo controller
 * também aplica o {@link EmployeeRestrictionsGuard}.
 */
export const RestrictEmployee = () => SetMetadata(RESTRICT_EMPLOYEE_KEY, true);
