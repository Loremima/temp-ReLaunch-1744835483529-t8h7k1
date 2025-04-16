import { useState, useEffect } from 'react';
import { useUser } from './useUser';
import { supabase } from '../lib/supabase';

type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'unpaid' | 'incomplete' | null;

export type Subscription = {
  id: string;
  plan: 'free' | 'pro' | 'business' | null;
  status: SubscriptionStatus;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  updated_at: string;
};

export function useSubscription() {
  const { profile, loading: userLoading } = useUser();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Charger l'abonnement au chargement du composant ou lorsque l'utilisateur change
  useEffect(() => {
    if (!userLoading && profile?.id) {
      fetchSubscription();
    } else if (!userLoading && !profile) {
      setSubscription(null);
      setLoading(false);
    }
  }, [profile, userLoading]);

  // Fonction pour récupérer l'abonnement depuis Supabase
  const fetchSubscription = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', profile?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        throw error;
      }

      // Si aucun abonnement trouvé, utiliser le forfait gratuit par défaut
      if (!data) {
        setSubscription({
          id: 'free-plan',
          plan: 'free',
          status: 'active',
          current_period_end: null,
          cancel_at_period_end: false,
          stripe_customer_id: null,
          stripe_subscription_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      } else {
        setSubscription(data as Subscription);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la récupération de l\'abonnement');
      console.error('Erreur de récupération d\'abonnement:', err);
    } finally {
      setLoading(false);
    }
  };

  // Annuler l'abonnement
  const cancelSubscription = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        body: { cancelAtPeriodEnd: true }
      });

      if (error) {
        throw error;
      }

      // Mettre à jour l'état local
      if (subscription) {
        setSubscription({
          ...subscription,
          cancel_at_period_end: true
        });
      }

      return { success: true };
    } catch (err: any) {
      console.error('Erreur lors de l\'annulation de l\'abonnement:', err);
      return { success: false, error: err.message || 'Erreur lors de l\'annulation de l\'abonnement' };
    }
  };

  // Réactiver un abonnement marqué pour annulation
  const resumeSubscription = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        body: { cancelAtPeriodEnd: false }
      });

      if (error) {
        throw error;
      }

      // Mettre à jour l'état local
      if (subscription) {
        setSubscription({
          ...subscription,
          cancel_at_period_end: false
        });
      }

      return { success: true };
    } catch (err: any) {
      console.error('Erreur lors de la réactivation de l\'abonnement:', err);
      return { success: false, error: err.message || 'Erreur lors de la réactivation de l\'abonnement' };
    }
  };

  // Changer de forfait
  const changeSubscription = async (newPlan: 'free' | 'pro' | 'business'): Promise<{ success: boolean; url?: string; error?: string }> => {
    try {
      const { data, error } = await supabase.functions.invoke('update-subscription', {
        body: {
          newPlan,
          returnUrl: window.location.origin + '/app/settings/account?update=success'
        }
      });

      if (error) {
        throw error;
      }

      return { success: true, url: data?.url };
    } catch (err: any) {
      console.error('Erreur lors du changement d\'abonnement:', err);
      return { success: false, error: err.message || 'Erreur lors du changement d\'abonnement' };
    }
  };

  // Vérifier si l'utilisateur peut accéder à une fonctionnalité en fonction de son abonnement
  const canAccess = (feature: 'unlimited_reminders' | 'unlimited_contacts' | 'multiple_users' | 'api' | 'ai_analysis' | 'personalized_reminders' | 'response_prediction'): boolean => {
    if (!subscription) return false;

    switch (feature) {
      case 'unlimited_reminders':
        return subscription.plan === 'pro' || subscription.plan === 'business';
      case 'unlimited_contacts':
        return subscription.plan === 'business';
      case 'multiple_users':
        return subscription.plan === 'business';
      case 'api':
        return subscription.plan === 'business';
      case 'ai_analysis':
        return subscription.plan === 'pro' || subscription.plan === 'business';
      case 'personalized_reminders':
        return subscription.plan === 'business';
      case 'response_prediction':
        return subscription.plan === 'business';
      default:
        return false;
    }
  };

  return {
    subscription,
    loading,
    error,
    fetchSubscription,
    cancelSubscription,
    resumeSubscription,
    changeSubscription,
    canAccess,
    isPro: subscription?.plan === 'pro',
    isBusiness: subscription?.plan === 'business',
    isFree: subscription?.plan === 'free'
  };
} 