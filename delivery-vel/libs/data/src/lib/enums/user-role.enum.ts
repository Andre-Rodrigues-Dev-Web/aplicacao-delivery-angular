export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
  DELIVERER = 'deliverer',
  MANAGER = 'manager',
  SUPPORT = 'support'
}

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.CUSTOMER]: 'Cliente',
  [UserRole.ADMIN]: 'Administrador',
  [UserRole.DELIVERER]: 'Entregador',
  [UserRole.MANAGER]: 'Gerente',
  [UserRole.SUPPORT]: 'Suporte'
};

export const USER_ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.CUSTOMER]: [
    'order:create',
    'order:view_own',
    'order:cancel_own',
    'profile:update_own',
    'address:manage_own',
    'cart:manage'
  ],
  [UserRole.DELIVERER]: [
    'order:view_assigned',
    'order:update_status',
    'delivery:manage',
    'profile:update_own'
  ],
  [UserRole.SUPPORT]: [
    'order:view_all',
    'order:update',
    'user:view',
    'user:update',
    'coupon:create',
    'coupon:update'
  ],
  [UserRole.MANAGER]: [
    'order:view_all',
    'order:update',
    'order:delete',
    'user:view',
    'user:update',
    'product:create',
    'product:update',
    'product:delete',
    'category:manage',
    'coupon:manage',
    'report:view'
  ],
  [UserRole.ADMIN]: [
    '*' // All permissions
  ]
};