
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateAdminFormProps {
  onSuccess: () => void;
  enablePrivilegeSelection?: boolean;
}

export function CreateAdminForm({ onSuccess, enablePrivilegeSelection = false }: CreateAdminFormProps) {
  const [email, setEmail] = useState("");
  const [adminLevel, setAdminLevel] = useState<string>("standard");
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error("Email é obrigatório");
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("Creating admin with email:", email);
      
      // First check if the user exists
      const { data: userData, error: userError } = await supabase.rpc("get_user_by_email", {
        p_email: email
      });
      
      if (userError) {
        console.error("Error fetching user:", userError);
        throw new Error("Erro ao buscar usuário");
      }
      
      if (!userData || !userData.id) {
        toast.error("Usuário não encontrado", {
          description: "Este email não está cadastrado no sistema."
        });
        return;
      }
      
      console.log("Found user:", userData);
      
      // Check if user is already an admin via edge function
      try {
        const { data: adminCheck, error: adminCheckError } = await supabase.functions.invoke('is_admin_user', {
          body: { user_id: userData.id }
        });
        
        if (adminCheckError) {
          console.error("Error checking admin status:", adminCheckError);
          throw new Error("Erro ao verificar status de administrador");
        }
        
        console.log("Admin check result:", adminCheck);
        
        if (adminCheck?.isAdmin) {
          toast.error("Este usuário já é administrador");
          return;
        }
      } catch (checkErr) {
        console.error("Error in admin check:", checkErr);
        toast.error("Erro ao verificar status de administrador", {
          description: checkErr instanceof Error ? checkErr.message : "Erro desconhecido"
        });
        return;
      }
      
      // Add user to admin_users table using RPC function
      const { data: newAdmin, error: insertError } = await supabase
        .rpc('add_admin_user', { 
          admin_user_id: userData.id,
          admin_email: email,
          admin_level: adminLevel
        });
        
      if (insertError) {
        console.error("Error adding admin:", insertError);
        throw new Error("Erro ao adicionar administrador: " + insertError.message);
      }
      
      console.log("Admin added successfully:", newAdmin);
      toast.success("Administrador adicionado com sucesso");
      setEmail("");
      onSuccess();
    } catch (err) {
      console.error("Error creating admin:", err);
      toast.error("Erro ao adicionar administrador", {
        description: err instanceof Error ? err.message : "Erro desconhecido"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email do usuário</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="usuario@exemplo.com"
          required
        />
        <p className="text-sm text-muted-foreground">
          O usuário deve já estar cadastrado no sistema.
        </p>
      </div>
      
      {enablePrivilegeSelection && (
        <div className="space-y-2">
          <Label htmlFor="adminLevel">Nível de Privilégio</Label>
          <Select
            value={adminLevel}
            onValueChange={setAdminLevel}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um nível" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Administrador Padrão</SelectItem>
              <SelectItem value="master">Administrador Master</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Administradores Master podem gerenciar todos os usuários e outros administradores.
            Administradores Padrão só podem gerenciar usuários regulares.
          </p>
        </div>
      )}
      
      <div className="pt-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <span className="flex items-center">
              <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
              Adicionando...
            </span>
          ) : (
            "Adicionar Administrador"
          )}
        </Button>
      </div>
    </form>
  );
}
