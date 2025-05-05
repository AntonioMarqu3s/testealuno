
import React from "react";
import { useLocation, Link } from "react-router-dom";
import { useAdminAuth } from "@/context/AdminAuthContext";

// Replace this with your own implementation based on what you need
export function Sidebar() {
  const location = useLocation();
  const { currentUserAdminLevel } = useAdminAuth();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const menuItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/admin/users", label: "Usuários", icon: "👥" },
    { path: "/admin/agents", label: "Agentes", icon: "🤖" },
    { path: "/admin/payments", label: "Pagamentos", icon: "💰" },
    { path: "/admin/plans", label: "Planos", icon: "📝" },
    { 
      path: "/admin/administrators", 
      label: "Administradores", 
      icon: "👮‍♂️",
      requiresMasterAdmin: true
    },
    { 
      path: "/admin/groups", 
      label: "Grupos", 
      icon: "👨‍👩‍👧‍👦",
      requiresMasterAdmin: true
    },
    { path: "/admin/settings", label: "Configurações", icon: "⚙️" },
  ];

  return (
    <nav className="space-y-1 px-2 py-5">
      {menuItems.map((item) => {
        // Skip items that require master admin level if user is not a master admin
        if (item.requiresMasterAdmin && currentUserAdminLevel !== 'master') {
          return null;
        }
        
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              isActive(item.path)
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <span className="mr-3">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
