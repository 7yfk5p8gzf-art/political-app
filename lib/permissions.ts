import { Role } from '@/types/user';

export function canPublish(role: Role) {
  return role === 'superadmin' || role === 'admin';
}

export function canManageUsers(role: Role) {
  return role === 'superadmin';
}

export function canReview(role: Role) {
  return role === 'superadmin' || role === 'admin' || role === 'reviewer';
}
