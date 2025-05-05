
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Group } from '@/types/admin';
import { toast } from 'sonner';

export function useAdminGroups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      
      // Call the admin_list_groups function
      const { data, error } = await supabase.rpc('admin_list_groups');
      
      if (error) {
        console.error('Error fetching groups:', error);
        toast.error('Erro ao buscar grupos: ' + error.message);
        return;
      }
      
      setGroups(data || []);
    } catch (err) {
      console.error('Exception fetching groups:', err);
      toast.error('Erro ao buscar grupos');
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async (name: string, description?: string) => {
    try {
      if (!name.trim()) {
        toast.error('Nome do grupo é obrigatório');
        return false;
      }

      const { data, error } = await supabase.rpc('admin_create_group', {
        p_name: name.trim(),
        p_description: description ? description.trim() : null
      });

      if (error) {
        console.error('Error creating group:', error);
        toast.error('Erro ao criar grupo: ' + error.message);
        return false;
      }

      toast.success('Grupo criado com sucesso!');
      fetchGroups(); // Refresh the groups list
      return true;
    } catch (err) {
      console.error('Exception creating group:', err);
      toast.error('Erro ao criar grupo');
      return false;
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return {
    groups,
    loading,
    fetchGroups,
    createGroup
  };
}
