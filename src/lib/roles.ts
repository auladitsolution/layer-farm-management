import { UserRole } from '@/types';

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  OWNER: 5,
  MANAGER: 4,
  ACCOUNTANT: 3,
  INVENTORY_MANAGER: 2,
  STAFF: 1,
};

export const ROLE_LABELS_BN: Record<UserRole, string> = {
  OWNER: 'মালিক / সুপার অ্যাডমিন',
  MANAGER: 'ফার্ম ম্যানেজার',
  ACCOUNTANT: 'হিসাবরক্ষক',
  INVENTORY_MANAGER: 'স্টোর ম্যানেজার',
  STAFF: 'ফার্ম কর্মী',
};

/**
 * Checks if a user's role has permission for allowed roles
 */
export function hasRequiredRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  if (userRole === 'OWNER') return true; // Owner always has full access
  return allowedRoles.includes(userRole);
}
