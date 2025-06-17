import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';

export const useRoleAccess = () => {
  const { user, hasRole, hasAnyRole, isCustomer, isWaiter, isVisitor } = useAuth();

  const canAccess = (allowedRoles: UserRole[]): boolean => {
    return hasAnyRole(allowedRoles);
  };

  const getRedirectPath = (userRole: UserRole): string => {
    switch (userRole) {
      case UserRole.WAITER:
        return '/waiter-dashboard';
      case UserRole.CUSTOMER:
      default:
        return '/homepage';
    }
  };

  const getRoleDisplayName = (role: UserRole): string => {
    switch (role) {
      case UserRole.CUSTOMER:
        return 'Customer';
      case UserRole.WAITER:
        return 'Waiter';
      case UserRole.VISITOR:
        return 'Visitor';
      default:
        return 'Unknown';
    }
  };

  const getCurrentUserRole = (): UserRole | null => {
    return user?.role || null;
  };

  const getCurrentUserRoleDisplay = (): string => {
    const role = getCurrentUserRole();
    return role ? getRoleDisplayName(role) : 'Not logged in';
  };

  return {
    user,
    hasRole,
    hasAnyRole,
    isCustomer,
    isWaiter,
    isVisitor,
    canAccess,
    getRedirectPath,
    getRoleDisplayName,
    getCurrentUserRole,
    getCurrentUserRoleDisplay,
  };
};
