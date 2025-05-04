
import React from "react";
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  Calendar,
  CreditCard,
  Shield,
  FolderKanban
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminMenu, AdminMenuItem } from "@/hooks/admin/useAdminMenu";

export function AdminSidebar() {
  const { menuItems } = useAdminMenu();
  
  // Map of icon names to their components
  const iconMap: Record<string, React.ComponentType<any>> = {
    LayoutDashboard,
    Users,
    Settings,
    Calendar,
    CreditCard,
    Shield,
    FolderKanban
  };

  return (
    <aside className="w-64 bg-card border-r h-screen flex flex-col">
      <div className="p-6 border-b flex items-center gap-2">
        <Shield className="h-6 w-6 text-primary" />
        <span className="font-bold text-lg">Agente Conecta</span>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item: AdminMenuItem) => {
            const IconComponent = iconMap[item.icon];
            return (
              <SidebarItem 
                key={item.path}
                to={item.path} 
                icon={<IconComponent className="h-5 w-5" />}
                label={item.label}
              />
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t">
        <div className="text-xs text-muted-foreground">
          Painel Administrativo v1.0
        </div>
      </div>
    </aside>
  );
}

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

function SidebarItem({ to, icon, label }: SidebarItemProps) {
  return (
    <li>
      <NavLink
        to={to}
        className={({ isActive }) =>
          cn(
            "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
            isActive
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted"
          )
        }
      >
        {icon}
        <span>{label}</span>
      </NavLink>
    </li>
  );
}
