import { Types } from 'mongoose';

export interface Scope {
  ownerId: string;
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

export function ownerFilter(scope: Scope): Record<string, any> {
  return scope.admin ? {} : { owner: new Types.ObjectId(scope.ownerId) };
}

export function idFilter(id: string, scope: Scope): Record<string, any> {
  const filter: Record<string, any> = { _id: id };
  if (!scope.admin) filter.owner = new Types.ObjectId(scope.ownerId);
  return filter;
}
