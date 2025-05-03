
import { useAdminUsersList } from './useAdminUsersList';
import { useAdminUserCreate } from './useAdminUserCreate';
import { useAdminUserDelete } from './useAdminUserDelete';

export type { AdminUser } from './useAdminUsersList';

export function useAdminUsersManagement() {
  const { adminUsers, isLoading, error, fetchAdminUsers } = useAdminUsersList();
  const { createAdminUser, isCreating } = useAdminUserCreate();
  const { deleteAdminUser, isDeleting } = useAdminUserDelete();

  return {
    // Data and state
    adminUsers,
    isLoading: isLoading || isCreating || isDeleting,
    error,
    
    // Actions
    fetchAdminUsers,
    createAdminUser,
    deleteAdminUser
  };
}
