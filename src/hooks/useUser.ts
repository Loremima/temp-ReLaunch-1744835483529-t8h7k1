import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export interface UserProfile {
  id?: string;
  user_id: string;
  email?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  photo_url?: string;
  created_at?: string;
  updated_at?: string;
}

export function useUser() {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erreur lors de la récupération du profil:', error);
        setError(error.message);
      } else if (data) {
        // Ajouter l'email depuis l'utilisateur authentifié
        setProfile({
          ...data,
          email: user.email || ''
        });
      } else {
        // Profil non trouvé, créer un profil par défaut
        const userMetadata = user.user_metadata || {};
        const defaultProfile: UserProfile = {
          user_id: user.id,
          email: user.email || '',
          full_name: userMetadata.name || '',
          first_name: userMetadata.first_name || '',
          last_name: userMetadata.last_name || '',
        };
        
        // Insérer le profil par défaut dans la base de données
        const { error: insertError } = await supabase
          .from('profiles')
          .insert(defaultProfile);
        
        if (insertError) {
          console.error('Erreur lors de la création du profil:', insertError);
          setError(insertError.message);
        } else {
          setProfile(defaultProfile);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur s\'est produite';
      console.error('Erreur inattendue:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (updatedProfile: Partial<UserProfile>) => {
    if (!user?.id || !profile) {
      setError('Utilisateur non authentifié ou profil non chargé');
      return { error: 'Utilisateur non authentifié ou profil non chargé' };
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Ajouter les champs nécessaires
      const dataToUpdate = {
        ...updatedProfile,
        updated_at: new Date().toISOString(),
        user_id: user.id,
      };
      
      // Mettre à jour le profil dans Supabase
      const { error } = await supabase
        .from('profiles')
        .upsert(dataToUpdate, { onConflict: 'user_id' });
      
      if (error) {
        console.error('Erreur lors de la mise à jour du profil:', error);
        setError(error.message);
        return { error: error.message };
      }
      
      // Si le nom complet est modifié, mettre à jour les métadonnées de l'utilisateur
      if (updatedProfile.full_name) {
        await supabase.auth.updateUser({
          data: { name: updatedProfile.full_name }
        });
      }
      
      // Mettre à jour l'état local
      setProfile({
        ...profile,
        ...updatedProfile,
        email: user.email || profile.email || ''
      });
      return { success: true };
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur s\'est produite';
      console.error('Erreur inattendue:', err);
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading,
    error,
    fetchUserProfile,
    updateUserProfile,
  };
} 