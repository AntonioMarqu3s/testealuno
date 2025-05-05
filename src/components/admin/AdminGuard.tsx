import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { toast } from "sonner";

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { isAdmin, isLoading } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      toast.error("Acesso restrito", {
        description: "Você não tem permissão para acessar esta área"
      });
      navigate("/admin");
    }
  }, [isAdmin, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Acesso Negado</h1>
          <p className="text-muted-foreground mt-2">
            Você precisa estar logado como administrador para acessar essa página.
          </p>
          <a 
            href="/admin" 
            className="mt-4 inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Ir para o login
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
