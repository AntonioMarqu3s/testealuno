import React from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useUserDetailDrawer } from "@/hooks/admin/useUserDetailDrawer";
import { UserDetailFields } from "./drawer/UserDetailFields";
import { UserForm } from "./drawer/UserForm";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface UserDetailDrawerProps {
  userId: string | null;
  open: boolean;
  onClose: () => void;
  onUserUpdated: () => void;
}

export function UserDetailDrawer({ userId, open, onClose, onUserUpdated }: UserDetailDrawerProps) {
  const {
    userData,
    isLoading,
    isUpdating,
    showPasswordFields,
    handlePasswordToggle,
    handleUpdateUser,
  } = useUserDetailDrawer(userId, onClose, onUserUpdated);

  const handleSavePlanDetails = async (data: any) => {
    if (!userId || !data.plan) return;

    try {
      const { error } = await supabase
        .from('user_plans')
        .update({
          name: data.plan.name,
          agent_limit: data.plan.agent_limit,
          payment_status: data.plan.payment_status,
          payment_date: data.plan.payment_date,
          subscription_ends_at: data.plan.subscription_ends_at,
          trial_ends_at: data.plan.trial_ends_at
        })
        .eq('user_id', userId);

      if (error) throw error;
      
      toast.success("Plano atualizado com sucesso");
      onUserUpdated();
    } catch (error) {
      console.error("Erro ao atualizar plano:", error);
      toast.error("Erro ao atualizar plano");
    }
  };
  
  return (
    <Drawer open={open} onClose={onClose}>
      <DrawerContent className="h-[90vh] max-h-[90vh]">
        <div className="mx-auto w-full max-w-4xl">
          <DrawerHeader>
            <DrawerTitle className="text-2xl font-bold">
              {isLoading ? "Carregando..." : `Editar Usuário: ${userData?.email || ""}`}
            </DrawerTitle>
          </DrawerHeader>
          
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-6">
                <UserDetailFields 
                  userData={userData} 
                  isLoading={isLoading}
                  onSave={handleSavePlanDetails}
                />
                
                {userData && (
                  <UserForm
                    userData={userData}
                    isUpdating={isUpdating}
                    showPasswordFields={showPasswordFields}
                    handlePasswordToggle={handlePasswordToggle}
                    onSubmit={handleUpdateUser}
                  />
                )}
              </div>
            )}
          </div>
          
          <DrawerFooter className="px-6">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
