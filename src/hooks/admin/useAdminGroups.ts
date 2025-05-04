
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
        .from('groups')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Convert the data to include the optional total_users and total_admins fields
      const groupsWithOptionalFields = data.map(group => ({
        ...group,
        total_users: group.total_users || 0,
        total_admins: group.total_admins || 0,
      })) as Group[];

      setGroups(groupsWithOptionalFields);
    } catch (error: any) {
      console.error("Error fetching groups:", error);
      toast.error("Falha ao carregar grupos", {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function createGroup(name: string, description: string) {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Usuário não autenticado");
      }
      
      const { data, error } = await supabase
        .from('groups')
        .insert({
          name,
          description,
          created_by: user.id
        })
        .select()
        .single();
        
      if (error) throw error;
      
      toast.success("Grupo criado com sucesso");
      
      // Refresh groups list
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

  async function updateGroup(id: string, name: string, description: string) {
    try {
      const { error } = await supabase
        .from('groups')
        .update({ name, description })
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success("Grupo atualizado com sucesso");
      
      // Refresh groups list
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
        .from('groups')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success("Grupo excluído com sucesso");
      
      // Refresh groups list and reset selection
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
