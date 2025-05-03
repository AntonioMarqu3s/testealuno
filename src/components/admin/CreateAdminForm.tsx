
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface CreateAdminFormProps {
  onSuccess: () => void;
}

export function CreateAdminForm({ onSuccess }: CreateAdminFormProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error("Email é obrigatório");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // First check if the user exists
      const { data: userData, error: userError } = await supabase.rpc("get_user_by_email", {
        p_email: email
      });
      
      if (userError) {
        throw new Error("Erro ao buscar usuário");
      }
      
      if (!userData) {
        toast.error("Usuário não encontrado", {
          description: "Este email não está cadastrado no sistema."
        });
        return;
      }
      
      // Check if user is already an admin
      const { data: existingAdmin, error: adminCheckError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', userData.id)
        .single();
        
      if (adminCheckError && adminCheckError.code !== "PGRST116") { // PGRST116 is "no rows returned" error
        throw new Error("Erro ao verificar status de administrador");
      }
      
      if (existingAdmin) {
        toast.error("Este usuário já é administrador");
        return;
      }
      
      // Add user to admin_users table
      const { error: insertError } = await supabase
        .from('admin_users')
        .insert([{ user_id: userData.id }]);
        
      if (insertError) {
        throw new Error("Erro ao adicionar administrador");
      }
      
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
