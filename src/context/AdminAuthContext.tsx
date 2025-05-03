
import React, { createContext, useContext } from "react";
import { useAdminAuthentication } from "@/hooks/admin/useAdminAuthentication";
import { useAdminSession } from "@/hooks/admin/useAdminSession";

export const ADMIN_SESSION_KEY = "admin_authenticated";

type AdminAuthContextType = {
  isAdmin: boolean;
  isLoading: boolean;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  adminLogout: () => Promise<void>;
  currentUserAdminId?: string | null;
  currentUserAdminLevel?: string | null;
};

const AdminAuthContext = createContext<AdminAuthContextType>({
  isAdmin: false,
  isLoading: true,
  adminLogin: async () => false,
  adminLogout: async () => {},
});

export const useAdminAuth = () => useContext(AdminAuthContext);

interface AdminAuthProviderProps {
  children: React.ReactNode;
}

export const AdminAuthProvider = ({ children }: AdminAuthProviderProps) => {
  // Use the extracted admin session hook
  const {
    isAdmin: sessionIsAdmin,
    setIsAdmin: setSessionIsAdmin,
    isLoading: sessionIsLoading,
    setIsLoading: setSessionIsLoading,
    currentUserAdminId,
    currentUserAdminLevel,
  } = useAdminSession();

  // Use the extracted admin authentication hook
  const {
    adminLogin,
    adminLogout: logoutFn,
  } = useAdminAuthentication();

  // Wrap the logout function to update our session state too
  const adminLogout = async () => {
    await logoutFn();
    setSessionIsAdmin(false);
  };

  // Provide combined context
  return (
    <AdminAuthContext.Provider 
      value={{ 
        isAdmin: sessionIsAdmin, 
        isLoading: sessionIsLoading, 
        adminLogin, 
        adminLogout,
        currentUserAdminId,
        currentUserAdminLevel,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};
