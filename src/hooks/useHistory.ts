import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { HistoryEntry } from '../types';

export function useHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRange, setDateRange] = useState<{ start: string | null; end: string | null }>({
    start: null,
    end: null
  });

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const { data: historyData, error: historyError } = await supabase
        .from('history')
        .select(`
          id,
          sent_at,
          status,
          user_id,
          prospect_id,
          template_id,
          prospect:prospects (
            name,
            email,
            company
          ),
          template:templates (
            subject,
            stage
          )
        `)
        .eq('user_id', user?.id)
        .order('sent_at', { ascending: false });

      if (historyError) throw historyError;

      // Process the data to replace placeholders
      const processedHistory = (historyData || []).map(entry => {
        if (!entry.template || !entry.prospect) return entry;

        // Define default values
        const nameValue = entry.prospect.name || 'there';
        const companyValue = entry.prospect.company || 'your company';

        // Replace placeholders in subject using case-insensitive global replacements
        const subject = entry.template.subject
          .replace(/{name}/gi, nameValue)
          .replace(/{company}/gi, companyValue);

        return {
          ...entry,
          template: {
            ...entry.template,
            subject
          }
        };
      });

      setHistory(processedHistory as HistoryEntry[]);
      setError(null);
    } catch (error: any) {
      console.error('Error fetching history:', error);
      setError('Impossible de charger l\'historique des emails.');
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = () => {
    let filtered = [...history];

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(entry => 
        (entry.prospect?.name?.toLowerCase() || '').includes(searchLower) ||
        (entry.prospect?.email?.toLowerCase() || '').includes(searchLower) ||
        (entry.prospect?.company?.toLowerCase() || '').includes(searchLower) ||
        (entry.template?.subject?.toLowerCase() || '').includes(searchLower)
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(entry => entry.status === statusFilter);
    }

    // Date range filter
    if (dateRange.start || dateRange.end) {
      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.sent_at).getTime();
        
        if (dateRange.start && dateRange.end) {
          const startDate = new Date(dateRange.start).getTime();
          const endDate = new Date(dateRange.end).getTime() + 86400000; // Add 24 hours to include the end date
          return entryDate >= startDate && entryDate <= endDate;
        } else if (dateRange.start) {
          const startDate = new Date(dateRange.start).getTime();
          return entryDate >= startDate;
        } else if (dateRange.end) {
          const endDate = new Date(dateRange.end).getTime() + 86400000; // Add 24 hours to include the end date
          return entryDate <= endDate;
        }
        
        return true;
      });
    }

    return filtered;
  };

  return {
    history,
    filteredHistory: filteredHistory(),
    loading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    dateRange,
    setDateRange,
    fetchHistory,
  };
} 