
import React from "react";
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  Calendar,
  CreditCard,
  Shield,
  LogOut,
  FolderKanban
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminMenu } from "@/hooks/admin/useAdminMenu";
import { useAdminAuth } from "@/context/AdminAuthContext";

const iconMap = {
  LayoutDashboard,
  Users,
  Settings,
  Calendar,
  CreditCard,
  Shield,
  FolderKanban
};

export function AdminSidebar() {
  const { menuItems, activeItem } = useAdminMenu();
  const { adminLogout } = useAdminAuth();

  return (
    <aside className="w-64 bg-card border-r h-screen flex flex-col">
      <div className="p-6 border-b flex items-center gap-2">
        <Shield className="h-6 w-6 text-primary" />
        <span className="font-bold text-lg">Agente Conecta</span>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap];
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    )
                  }
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t">
        <button
          onClick={adminLogout}
          className="flex items-center gap-2 w-full px-3 py-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Sair</span>
        </button>
        
        <div className="text-xs text-muted-foreground mt-4">
          Painel Administrativo v1.0
        </div>
      </div>
    </aside>
  );
}
