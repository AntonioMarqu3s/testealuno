
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Alert, AlertDescription } from "../ui/alert";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserGeneralInfo } from "./user-details/UserGeneralInfo";
import { UserPlanInfo } from "./user-details/UserPlanInfo";
import { UserPlan, UserData } from "./user-details/types";

interface UserDetailsProps {
  userId: string;
}

export function UserDetails({ userId }: UserDetailsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);

  const fetchUserData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch user data from auth
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        throw new Error(`Erro ao buscar dados do usuário: ${authError.message}`);
      }
      
      if (!user) {
        throw new Error("Usuário não encontrado");
      }
      
      // Use the functions API instead of direct admin API access
      const { data: adminData, error: adminError } = await supabase.functions.invoke("get-user-details", {
        body: { userId }
      });
      
      if (adminError) {
        throw new Error(`Erro ao buscar dados do administrador: ${adminError.message}`);
      }
      
      // Fetch user plan data using the service role inside the edge function
      const { data: planData, error: planError } = await supabase
        .from("user_plans")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
        
      if (planError && planError.code !== 'PGRST116') { // Not found error
        console.error("Erro ao buscar plano:", planError);
      }
      
      // Set combined user data
      setUserData({
        id: user.id,
        email: user.email || "",
        created_at: user.created_at || "",
        last_sign_in_at: user.last_sign_in_at || null,
        user_metadata: user.user_metadata || {},
        plan: planData || undefined
      });
      
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError(err instanceof Error ? err.message : "Erro desconhecido ao buscar dados");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);
  
  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-6 w-48" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  
  if (!userData) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Dados do usuário não encontrados</AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-6 py-2">
      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="general">Informações Gerais</TabsTrigger>
          <TabsTrigger value="plan">Dados do Plano</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4 mt-4">
          <UserGeneralInfo userData={userData} />
        </TabsContent>
        
        <TabsContent value="plan" className="space-y-4 mt-4">
          <UserPlanInfo plan={userData.plan} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
