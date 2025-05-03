
import React, { useState } from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Shield } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { adminLogin } = useAdminAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await adminLogin(email, password);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Painel Administrativo</CardTitle>
          <CardDescription>
            Entre com suas credenciais administrativas para gerenciar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@exemplo.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                  Autenticando...
                </span>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
