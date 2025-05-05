import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Group } from "@/types/admin";

export function useAdminGroups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  async function fetchGroups() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('grupos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setGroups(data as Group[]);
    } catch (error: any) {
      console.error("Error fetching groups:", error);
      toast.error("Falha ao carregar grupos", {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function createGroup(nome: string, descricao: string, adminId?: string) {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuário não autenticado");
      }
      const insertData: any = {
        nome,
        descricao,
        user_id: user.id,
        created_at: new Date().toISOString(),
      };
      if (adminId) insertData.admin_id = adminId;
      const { data, error } = await supabase
        .from('grupos')
        .insert(insertData)
        .select()
        .single();
      if (error) throw error;
      toast.success("Grupo criado com sucesso");
      fetchGroups();
      return data as Group;
    } catch (error: any) {
      console.error("Error creating group:", error);
      toast.error("Erro ao criar grupo", {
        description: error.message
      });
      return null;
    }
  }

  async function updateGroup(id: string, nome: string, descricao: string, adminId?: string) {
    try {
      const updateData: any = { nome, descricao };
      if (adminId) updateData.admin_id = adminId;
      const { error } = await supabase
        .from('grupos')
        .update(updateData)
        .eq('id', id);
      if (error) throw error;
      toast.success("Grupo atualizado com sucesso");
      fetchGroups();
      return true;
    } catch (error: any) {
      console.error("Error updating group:", error);
      toast.error("Erro ao atualizar grupo", {
        description: error.message
      });
      return false;
    }
  }

  async function deleteGroup(id: string) {
    try {
      const { error } = await supabase
        .from('grupos')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success("Grupo excluído com sucesso");
      fetchGroups();
      if (selectedGroup?.id === id) {
        setSelectedGroup(null);
      }
      return true;
    } catch (error: any) {
      console.error("Error deleting group:", error);
      toast.error("Erro ao excluir grupo", {
        description: error.message
      });
      return false;
    }
  }

  return {
    groups,
    isLoading,
    selectedGroup,
    setSelectedGroup,
    fetchGroups,
    createGroup,
    updateGroup,
    deleteGroup
  };
}
