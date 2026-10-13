import { Types } from 'mongoose';

export interface Scope {
  ownerId: string;
  /**
   * Administrador DENTRO do próprio restaurante (papel do funcionário/conta).
   * NÃO é administrador da plataforma: nunca autoriza ver ou editar dados de
   * outro restaurante — todos os filtros abaixo sempre escopam por `owner`.
   */
  admin: boolean;
}

export function scopeOf(user: {
  userId: string;
  role?: string;
}): Scope {
  return {
    ownerId: user.userId,
    admin: user.role === 'admin',
  };
}

/**
 * Filtro de pertencimento ao restaurante. Todo registro carregado pertence a
 * um dono (`owner`) e nenhum consulta pode omitir esse filtro — nem para
 * administradores, que administram apenas o próprio restaurante.
 */
export function ownerFilter(scope: Scope): Record<string, any> {
  return { owner: new Types.ObjectId(scope.ownerId) };
}

/** Filtro por id restrito ao restaurante do solicitante (id de outro dono → não encontrado). */
export function idFilter(id: string, scope: Scope): Record<string, any> {
  return { _id: id, owner: new Types.ObjectId(scope.ownerId) };
}
