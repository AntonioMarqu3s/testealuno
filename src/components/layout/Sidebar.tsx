
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { 
  Grid2X2, 
  PlusCircle, 
  Settings, 
  CreditCard, 
  LayoutDashboard, 
  LogOut 
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getCurrentUserEmail } from "@/services";
import { toast } from "sonner";

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const userEmail = getCurrentUserEmail();

  const menuItems = [
    {
      title: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Meus Agentes",
      path: "/agents",
      icon: Grid2X2,
    },
    {
      title: "Criar Agente",
      path: "/create-agent",
      icon: PlusCircle,
    },
    {
      title: "Planos",
      path: "/plans",
      icon: CreditCard,
    },
    {
      title: "Configurações",
      path: "/settings",
      icon: Settings,
    },
  ];
  
  const handleLogout = () => {
    // In a real app, we would clear the auth token here
    localStorage.removeItem('user_email');
    toast.success("Logout realizado com sucesso");
    navigate("/auth");
  };

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="h-16 flex items-center px-6">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold">AH</span>
          </div>
          <span className="font-bold text-lg">Agent Hub</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton 
                    asChild
                    className={cn(
                      "gap-2",
                      currentPath === item.path && "bg-sidebar-accent text-accent-foreground"
                    )}
                  >
                    <Link to={item.path}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src="" />
              <AvatarFallback>{userEmail ? userEmail[0].toUpperCase() : "U"}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Minha Conta</span>
              <span className="text-xs text-muted-foreground">{userEmail}</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
