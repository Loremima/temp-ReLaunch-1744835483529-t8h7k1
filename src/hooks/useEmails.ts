import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface EmailStats {
  sent: number;
  opened: number;
  clicked: number;
  replied: number;
}

export function useEmails() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailStats, setEmailStats] = useState<EmailStats>({
    sent: 0,
    opened: 0,
    clicked: 0,
    replied: 0
  });

  /**
   * Récupère les statistiques des emails
   */
  const fetchEmailStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cette fonction serait implémentée avec de vraies requêtes à la base de données
      // Pour l'instant, on utilise des valeurs fictives
      
      // Exemple de requête qui pourrait être utilisée:
      // const { data, error } = await supabase
      //   .from('email_history')
      //   .select('status')
      //   .eq('user_id', user?.id);
      
      setTimeout(() => {
        setEmailStats({
          sent: 150,
          opened: 85,
          clicked: 42,
          replied: 26
        });
        setLoading(false);
      }, 500);
    } catch (error: any) {
      console.error('Erreur lors de la récupération des statistiques emails:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  /**
   * Calcule le taux d'ouverture des emails
   */
  const getOpenRate = () => {
    return emailStats.sent > 0
      ? Math.round((emailStats.opened / emailStats.sent) * 100)
      : 0;
  };

  /**
   * Calcule le taux de clic des emails
   */
  const getClickRate = () => {
    return emailStats.opened > 0
      ? Math.round((emailStats.clicked / emailStats.opened) * 100)
      : 0;
  };

  /**
   * Calcule le taux de réponse des emails
   */
  const getReplyRate = () => {
    return emailStats.sent > 0
      ? Math.round((emailStats.replied / emailStats.sent) * 100)
      : 0;
  };

  return {
    emailStats,
    loading,
    error,
    fetchEmailStats,
    getOpenRate,
    getClickRate,
    getReplyRate
  };
} 