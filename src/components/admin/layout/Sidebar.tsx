import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Receipt, 
  UserCog,
  UsersRound
} from "lucide-react";

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/admin/dashboard"
    },
    {
      title: "Usuários",
      icon: Users,
      href: "/admin/users"
    },
    {
      title: "Grupos",
      icon: UsersRound,
      href: "/admin/groups"
    },
    {
      title: "Administradores",
      icon: UserCog,
      href: "/admin/administrators"
    },
    {
      title: "Planos",
      icon: CreditCard,
      href: "/admin/plans"
    },
    {
      title: "Pagamentos",
      icon: Receipt,
      href: "/admin/payments"
    }
  ];

  return (
    <div className="pb-12 min-h-screen">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <Button
                key={item.href}
                variant={pathname === item.href ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  pathname === item.href && "bg-muted"
                )}
                onClick={() => router.push(item.href)}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 