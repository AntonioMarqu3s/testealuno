
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAdminAuth } from '@/context/AdminAuthContext';

export interface AdminMenuItem {
  path: string;
  label: string;
  icon: string;
  requiresMasterAdmin?: boolean;
}

export const useAdminMenu = () => {
  const location = useLocation();
  const { currentUserAdminLevel } = useAdminAuth();
  const [activeItem, setActiveItem] = useState<string>('');
  
  const isMasterAdmin = currentUserAdminLevel === 'master';

  const menuItems: AdminMenuItem[] = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { path: '/admin/users', label: 'Usuários', icon: 'Users' },
    { path: '/admin/plans', label: 'Planos', icon: 'Calendar' },
    { path: '/admin/payments', label: 'Pagamentos', icon: 'CreditCard' },
    { path: '/admin/administrators', label: 'Administradores', icon: 'Shield', requiresMasterAdmin: true },
    { path: '/admin/groups', label: 'Grupos', icon: 'Users2', requiresMasterAdmin: true },
    { path: '/admin/settings', label: 'Configurações', icon: 'Settings', requiresMasterAdmin: true },
  ];

  // Filter menu items based on user's admin level
  const visibleMenuItems = menuItems.filter(item => 
    !item.requiresMasterAdmin || (item.requiresMasterAdmin && isMasterAdmin)
  );

  useEffect(() => {
    const currentPath = location.pathname;
    setActiveItem(currentPath);
  }, [location]);

  return {
    menuItems: visibleMenuItems,
    activeItem,
    setActiveItem,
    isMasterAdmin,
  };
};
