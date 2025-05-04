
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Group } from '@/types/admin';

export function useAdminGroups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: groupsData, error: groupsError } = await supabase
        .rpc('admin_list_groups');

      if (groupsError) throw groupsError;

      // Convert the returned data to match our Group type
      const typedGroups: Group[] = groupsData.map(group => ({
        id: group.id,
        name: group.name,
        description: group.description || '',
        created_at: group.created_at,
        created_by: group.created_by,
        updated_at: group.updated_at,
        total_users: group.total_users,
        total_admins: group.total_admins
      }));
      
      setGroups(typedGroups);
    } catch (err) {
      console.error('Error fetching groups:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch groups'));
      toast.error('Erro ao carregar grupos');
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async (name: string, description: string) => {
    try {
      const { data, error } = await supabase
        .rpc('admin_create_group', { p_name: name, p_description: description });

      if (error) throw error;

      toast.success('Grupo criado com sucesso');
      fetchGroups();
      return true;
    } catch (err) {
      console.error('Error creating group:', err);
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
    error,
    fetchGroups,
    createGroup
  };
}
