import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export interface Prospect {
  id: string;
  name: string;
  email: string;
  company: string | null;
  first_contact: string;
  next_followup: string | null;
  status: 'Pending' | 'Sent' | 'Opened' | 'Clicked' | 'Responded' | 'Unsubscribed';
  followup_stage: number;
  notes: string | null;
  source: string | null;
  user_id: string;
}

interface ProspectFormData {
  name: string;
  email: string;
  company: string | null;
  first_contact: string;
  next_followup: string | null;
  status: 'Pending' | 'Sent' | 'Opened' | 'Clicked' | 'Responded' | 'Unsubscribed';
  followup_stage: number;
  notes: string | null;
  source: string | null;
}

interface ProspectFilters {
  searchTerm: string;
  statusFilter: string;
}

interface ProspectSort {
  field: keyof Prospect | 'none';
  direction: 'asc' | 'desc' | null;
}

export function useProspects() {
  const { user } = useAuth();
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProspectFilters>({
    searchTerm: '',
    statusFilter: ''
  });
  const [sort, setSort] = useState<ProspectSort>({ 
    field: 'next_followup', 
    direction: 'asc' 
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchProspects();
    }
  }, [user]);

  const fetchProspects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('prospects')
        .select('*')
        .eq('user_id', user?.id)
        .order('next_followup', { ascending: true });

      if (error) throw error;
      setProspects(data || []);
      setError(null);
    } catch (error: any) {
      console.error('Error fetching prospects:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const saveProspect = async (formData: ProspectFormData, id?: string) => {
    try {
      setError(null);

      if (id) {
        // Mise à jour d'un prospect existant
        const { error } = await supabase
          .from('prospects')
          .update(formData)
          .eq('id', id);

        if (error) throw error;
      } else {
        // Création d'un nouveau prospect
        const { error } = await supabase
          .from('prospects')
          .insert({
            ...formData,
            user_id: user?.id,
            first_contact: formData.first_contact || new Date().toISOString(),
          });

        if (error) throw error;
      }

      await fetchProspects();
      setEditingId(null);
      return true;
    } catch (error: any) {
      console.error('Error saving prospect:', error);
      setError(error.message);
      return false;
    }
  };

  const deleteProspect = async (id: string) => {
    try {
      setError(null);
      const { error } = await supabase
        .from('prospects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchProspects();
      return true;
    } catch (error: any) {
      console.error('Error deleting prospect:', error);
      setError(error.message);
      return false;
    }
  };

  const updateProspectStatus = async (id: string, status: Prospect['status']) => {
    try {
      setError(null);
      const { error } = await supabase
        .from('prospects')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      
      await fetchProspects();
      return true;
    } catch (error: any) {
      console.error('Error updating prospect status:', error);
      setError(error.message);
      return false;
    }
  };

  const validateEmail = (email: string): boolean => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  const filteredProspects = () => {
    let filtered = [...prospects];

    // Appliquer la recherche
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.email.toLowerCase().includes(searchLower) ||
          (p.company && p.company.toLowerCase().includes(searchLower))
      );
    }

    // Appliquer le filtre de statut
    if (filters.statusFilter) {
      filtered = filtered.filter((p) => p.status === filters.statusFilter);
    }

    // Appliquer le tri
    if (sort.field && sort.field !== 'none' && sort.direction) {
      const sortDirectionFactor = sort.direction === 'asc' ? 1 : -1;
      const sortField = sort.field;

      filtered.sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];

        // Traitement spécifique par type
        if (sortField === 'first_contact' || sortField === 'next_followup') {
          aValue = aValue ? new Date(aValue).getTime() : (sort.direction === 'asc' ? Infinity : -Infinity);
          bValue = bValue ? new Date(bValue).getTime() : (sort.direction === 'asc' ? Infinity : -Infinity);
        } else if (sortField === 'followup_stage') {
          // Conversion en nombre si nécessaire
          aValue = aValue as number;
          bValue = bValue as number;
        } else {
          // Comparaison de chaînes (ou autres types), gérer null/undefined
          aValue = String(aValue ?? '').toLowerCase();
          bValue = String(bValue ?? '').toLowerCase();
        }

        // Comparaison finale
        if (aValue < bValue) return -1 * sortDirectionFactor;
        if (aValue > bValue) return 1 * sortDirectionFactor;
        return 0;
      });
    }

    return filtered;
  };

  return {
    prospects,
    filteredProspects: filteredProspects(),
    loading,
    error,
    filters,
    setFilters,
    sort,
    setSort,
    editingId,
    setEditingId,
    fetchProspects,
    saveProspect,
    deleteProspect,
    updateProspectStatus,
    validateEmail
  };
}
