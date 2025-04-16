import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { AlertCircle, Save, Mail, Check } from 'lucide-react';

interface EmailSettings {
  email_provider: string;
  email_api_key: string;
  from_email?: string;
  from_name?: string;
}

export default function EmailSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [settings, setSettings] = useState<EmailSettings>({
    email_provider: 'resend',
    email_api_key: '',
    from_email: '',
    from_name: ''
  });

  useEffect(() => {
    if (user) {
      fetchEmailSettings();
    }
  }, [user]);

  const fetchEmailSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('email_provider, email_api_key, from_email, from_name')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings({
          email_provider: data.email_provider || 'resend',
          email_api_key: data.email_api_key || '',
          from_email: data.from_email || '',
          from_name: data.from_name || ''
        });
      }
    } catch (error: any) {
      setError('Erreur lors du chargement des paramètres: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const { data, error } = await supabase
        .from('settings')
        .upsert({
          user_id: user?.id,
          email_provider: settings.email_provider,
          email_api_key: settings.email_api_key,
          from_email: settings.from_email,
          from_name: settings.from_name
        })
        .select();

      if (error) throw error;

      setSuccess('Paramètres enregistrés avec succès');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      setError('Erreur lors de la sauvegarde: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };
}