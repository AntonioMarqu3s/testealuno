
import React from "react";
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  Calendar,
  CreditCard,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminSidebar() {
  return (
    <aside className="w-64 bg-card border-r h-screen flex flex-col">
      <div className="p-6 border-b flex items-center gap-2">
        <Shield className="h-6 w-6 text-primary" />
        <span className="font-bold text-lg">Agente Conecta</span>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          <SidebarItem 
            to="/admin/dashboard" 
            icon={<LayoutDashboard className="h-5 w-5" />}
            label="Dashboard"
          />
          
          <SidebarItem 
            to="/admin/users" 
            icon={<Users className="h-5 w-5" />}
            label="Usuários"
          />
          
          <SidebarItem 
            to="/admin/agents" 
            icon={<Settings className="h-5 w-5" />}
            label="Agentes"
          />
          
          <SidebarItem 
            to="/admin/plans" 
            icon={<Calendar className="h-5 w-5" />}
            label="Planos"
          />
          
          <SidebarItem 
            to="/admin/payments" 
            icon={<CreditCard className="h-5 w-5" />}
            label="Pagamentos"
          />
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
