import { useAuth } from '../app/auth/authContext';

// Hook para verificar permisos en frontend
export function usePermission(permission: string): boolean {
  const { user } = useAuth();
  if (!user || !user.roles) return false;
  // roles: [{ name, permissions: [string] }]
  return user.roles.some((role: any) => role.permissions?.includes(permission));
}

// Hook para verificar rol
export function useRole(roleName: string): boolean {
  const { user } = useAuth();
  if (!user || !user.roles) return false;
  return user.roles.some((role: any) => role.name === roleName);
}
