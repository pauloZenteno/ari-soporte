import { AdminRoleEnum } from './constants';

export const PERMISSIONS = {
  MANAGE_CLIENT_STATUS: 'manage_client_status', 
  VIEW_ALL_CLIENTS: 'view_all_clients',         
};

const ROLES_CONFIG = {
  [AdminRoleEnum.SuperAdmin]: [PERMISSIONS.MANAGE_CLIENT_STATUS, PERMISSIONS.VIEW_ALL_CLIENTS],
  [AdminRoleEnum.Admin]:      [PERMISSIONS.MANAGE_CLIENT_STATUS, PERMISSIONS.VIEW_ALL_CLIENTS],
  [AdminRoleEnum.Developer]:  [PERMISSIONS.MANAGE_CLIENT_STATUS, PERMISSIONS.VIEW_ALL_CLIENTS],
  [AdminRoleEnum.Support]:    [PERMISSIONS.MANAGE_CLIENT_STATUS, PERMISSIONS.VIEW_ALL_CLIENTS],
  [AdminRoleEnum.Seller]:     [], 
};

export const hasPermission = (roleId, permission) => {
  if (!roleId) return false;
  const userPermissions = ROLES_CONFIG[roleId] || [];
  return userPermissions.includes(permission);
};