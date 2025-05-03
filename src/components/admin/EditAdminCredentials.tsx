
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useAdminAuth } from "@/context/AdminAuthContext";

interface EditAdminCredentialsProps {
  adminId: string;
  onDone: () => void;
}

export function EditAdminCredentials({ adminId, onDone }: EditAdminCredentialsProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const { isAdmin } = useAdminAuth();
  
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        // Fetch the admin details
        const { data, error } = await supabase
          .from('admin_users')
          .select('email, user_id')
          .eq('id', adminId)
          .single();
        
        if (error) throw error;
        
        if (data) {
          setAdminEmail(data.email || "");
          
          // Check if this is the current logged in user
          const { data: userData } = await supabase.auth.getUser();
          setIsCurrentUser(userData?.user?.id === data.user_id);
        }
      } catch (error) {
        console.error("Error fetching admin details:", error);
        toast.error("Erro ao carregar dados do administrador");
      }
    };
    
    if (adminId) {
      fetchAdminData();
    }
  }, [adminId]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    if (password && password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }
    
    if (!email && !password) {
      toast.error("Informe email ou senha para atualizar");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("update-admin-credentials", {
        body: { 
          adminId,
          email: email || undefined,
          password: password || undefined,
        }
      });
      
      if (error) throw error;
      
      if (data.success) {
        toast.success("Credenciais atualizadas com sucesso");
        onDone();
        
        // If current user updated their own email, they need to re-login
        if (isCurrentUser && email) {
          toast.info("Por favor, faça login novamente com seu novo email");
          setTimeout(() => {
            supabase.auth.signOut();
          }, 2000);
        }
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Error updating admin credentials:", error);
      toast.error("Erro ao atualizar credenciais");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Editar Credenciais de {adminEmail || "Administrador"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Novo Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={adminEmail || "Email do administrador"}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Nova Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          
          <div className="flex space-x-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onDone}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || (!email && !password)}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                  Atualizando...
                </span>
              ) : (
                "Atualizar Credenciais"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
