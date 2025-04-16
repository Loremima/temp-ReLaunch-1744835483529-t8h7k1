import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Template, TemplateFormData } from '../types/emails';

export function useTemplates() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('user_id', user?.id)
        .order('stage', { ascending: true });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error: any) {
      console.error('Error fetching templates:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const saveTemplate = async (formData: TemplateFormData, id?: string) => {
    try {
      setError(null);

      if (id && id !== 'new') {
        const { error } = await supabase
          .from('templates')
          .update({
            name: formData.name,
            subject: formData.subject,
            body: formData.body,
            stage: formData.stage
          })
          .eq('id', id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('templates')
          .insert({
            user_id: user?.id,
            name: formData.name || `Stage ${formData.stage} Template`,
            subject: formData.subject,
            body: formData.body,
            stage: formData.stage
          });

        if (error) throw error;
      }

      await fetchTemplates();
      setError('Template saved successfully!');
      setTimeout(() => setError(null), 3000);
      return true;
    } catch (error: any) {
      console.error('Error saving template:', error);
      setError(error.message);
      return false;
    }
  };
  
  const deleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchTemplates();
      return true;
    } catch (error: any) {
      console.error('Error deleting template:', error);
      setError('Failed to delete template. Please try again.');
      return false;
    }
  };
  
  const sendTestEmail = async (template: Template) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email-direct`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            to: user?.email,
            subject: template.subject,
            html: template.body,
            name: 'Test User',
            project: 'Test Project',
            company: 'Test Company'
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to send test email');
      }

      setError('Test email sent successfully!');
      setTimeout(() => setError(null), 3000);
      return true;
    } catch (error: any) {
      console.error('Error sending test email:', error);
      setError('Failed to send test email');
      return false;
    }
  };
  
  useEffect(() => {
    if (user) fetchTemplates();
  }, [user]);
  
  return {
    templates,
    loading,
    error,
    setError,
    fetchTemplates,
    saveTemplate,
    deleteTemplate,
    sendTestEmail
  };
}