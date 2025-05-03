
import React from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface AdminNavbarProps {
  onLogout: () => Promise<void>;
}

export function AdminNavbar({ onLogout }: AdminNavbarProps) {
  return (
    <header className="bg-background border-b h-16 flex items-center px-6 justify-between">
      <div>
        <h1 className="text-lg font-medium">Painel Administrativo</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </div>
    </header>
  );
}
