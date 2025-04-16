import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Check, Edit, Trash, AlertCircle, Plus, Send, Loader2 } from 'lucide-react';
import TemplateForm, { TemplateFormData } from '../components/emails/TemplateForm';
import TemplateCard from '../components/emails/TemplateCard';
import { NotificationMessage } from '../components/common/NotificationMessage';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/ui/button';

interface Template {
  id: string;
  stage: number;
  name: string;
  subject: string;
  body: string;
}

interface Notification {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  id: number;
}

function Templates() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [testEmailStatus, setTestEmailStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [testingTemplateId, setTestingTemplateId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Générer un ID unique pour les notifications
  const generateNotificationId = () => Date.now();

  // Ajouter une notification
  const addNotification = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    const newNotification = { type, message, id: generateNotificationId() };
    setNotifications(prev => [...prev, newNotification]);

    // Supprimer automatiquement après 5 secondes
    setTimeout(() => {
      removeNotification(newNotification.id);
    }, 5000);
  };

  // Supprimer une notification
  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('user_id', user?.id)
        .order('stage', { ascending: true });

      if (error) throw error;
      setTemplates(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching templates:', error);
      setError('Failed to load templates. Please refresh the page.');
      setLoading(false);
      addNotification('error', 'Impossible de charger les templates.');
    }
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
  };

  const handleSave = async (formData: TemplateFormData) => {
    try {
      const isNew = editingId === 'new';
      const { data, error } = isNew
        ? await supabase
          .from('templates')
          .insert([
            { ...formData, user_id: user?.id }
          ])
          .select()
        : await supabase
          .from('templates')
          .update(formData)
          .eq('id', editingId)
          .eq('user_id', user?.id)
          .select();

      if (error) throw error;

      setEditingId(null);
      await fetchTemplates();

      // Ajouter une notification de succès
      addNotification('success', isNew ? 'Template créé avec succès!' : 'Template mis à jour avec succès!');
    } catch (error: any) {
      console.error('Error saving template:', error);
      setError('Failed to save template. Please try again.');

      // Ajouter une notification d'erreur
      addNotification('error', 'Impossible de sauvegarder le template. Veuillez réessayer.');
    }
  };

  const openDeleteModal = (template: Template) => {
    setTemplateToDelete(template);
    setIsModalOpen(true);
  };

  const closeDeleteModal = () => {
    setTemplateToDelete(null);
    setIsModalOpen(false);
  };

  const confirmDelete = async () => {
    if (!templateToDelete) return;
    try {
      const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', templateToDelete.id)
        .eq('user_id', user?.id);

      if (error) throw error;
      addNotification('info', `Template "${templateToDelete.name}" supprimé avec succès`);
      closeDeleteModal();
      await fetchTemplates(); // Rafraîchir la liste après suppression
    } catch (error: any) {
      console.error('Error deleting template:', error);
      setError('Failed to delete template. Please try again.');
      addNotification('error', 'Impossible de supprimer le template. Veuillez réessayer.');
      closeDeleteModal();
    }
  };

  const handleTestEmail = async (template: Template) => {
    setTestEmailStatus('sending');
    setTestingTemplateId(template.id);
    setError(null);

    try {
      // Récupérer les prospects
      const { data: prospects, error: prospectsError } = await supabase
        .from('prospects')
        .select('*')
        .eq('user_id', user?.id);

      console.log("Résultat de la requête prospects:", {
        count: prospects?.length || 0,
        data: prospects,
        error: prospectsError
      });

      if (prospectsError) throw prospectsError;

      if (prospects.length === 0) {
        throw new Error('No prospects found. Please add prospects first.');
      }

      // Récupérer les paramètres d'email
      const { data: settings, error: settingsError } = await supabase
        .from('settings')
        .select('email_provider, email_api_key')
        .eq('user_id', user?.id)
        .single();

      if (settingsError) throw settingsError;

      // Envoyer un email de test
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email-direct`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email_provider: settings.email_provider,
            email_api_key: settings.email_api_key,
            to: user?.email,
            subject: template.subject,
            html: template.body,
            template_id: template.id,
            user_id: user?.id
          })
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        if (responseData.duplicate && responseData.message) {
          addNotification('warning', responseData.message);
        } else {
          throw new Error(responseData.error || 'Failed to send test email');
        }
      } else {
        addNotification('success', 'Email de test envoyé avec succès!');
      }

      setTestEmailStatus('success');
      setTimeout(() => {
        setTestEmailStatus('idle');
        setTestingTemplateId(null);
      }, 3000);
    } catch (error: any) {
      console.error('Error sending test emails:', error);
      setError(error.message);
      setTestEmailStatus('error');
      addNotification('error', `Erreur lors de l'envoi: ${error.message}`);
      setTimeout(() => {
        setTestEmailStatus('idle');
        setTestingTemplateId(null);
      }, 3000);
    }
  };

  const handleTestAllProspects = async (template: Template) => {
    setTestEmailStatus('sending');
    setTestingTemplateId(template.id);
    setError(null);

    try {
      // Récupérer les prospects
      const { data: prospects, error: prospectsError } = await supabase
        .from('prospects')
        .select('*')
        .eq('user_id', user?.id);

      console.log("Résultat de la requête prospects:", {
        count: prospects?.length || 0,
        error: prospectsError
      });

      if (prospectsError) throw prospectsError;

      if (prospects.length === 0) {
        throw new Error('No prospects found. Please add prospects first.');
      }

      // Log tous les prospects pour débogage
      console.log("Liste complète des prospects:", prospects.map((p: any) => ({ name: p.name, email: p.email })));

      // Récupérer les paramètres d'email
      const { data: settings, error: settingsError } = await supabase
        .from('settings')
        .select('email_provider, email_api_key')
        .eq('user_id', user?.id)
        .single();

      if (settingsError) throw settingsError;

      // Envoyer un email à chaque prospect
      const results = await Promise.all(
        prospects.map(async (prospect: any) => {
          try {
            // Log avant envoi pour vérifier l'adresse exacte
            console.log(`Tentative d'envoi à: ${prospect.name} (${prospect.email})`);

            const response = await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email-direct`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  email_provider: settings.email_provider,
                  email_api_key: settings.email_api_key,
                  to: prospect.email,
                  name: prospect.name,
                  project: prospect.project || 'votre entreprise',
                  company: prospect.company || 'votre entreprise',
                  subject: template.subject,
                  html: template.body,
                  prospect_id: prospect.id,
                  template_id: template.id,
                  user_id: user?.id
                })
              }
            );

            // Log la réponse pour voir si tout s'est bien passé
            const responseData = await response.json();
            console.log(`Réponse pour ${prospect.email}:`, responseData);

            if (!response.ok) {
              // Si c'est une erreur de doublon, proposer d'envoyer le template suivant
              if (responseData.duplicate) {
                // Essayer d'envoyer le template suivant automatiquement
                if (await sendNextTemplate(prospect.id, template.stage)) {
                  return { success: true, prospect: prospect.email, nextSent: true };
                } else {
                  return {
                    success: false,
                    prospect: prospect.email,
                    error: responseData.message || 'Duplicate email',
                    duplicate: true
                  };
                }
              }
              throw new Error(responseData.error || 'Failed to send email');
            }

            return { success: true, prospect: prospect.email };
          } catch (error: any) {
            console.error(`Error sending to ${prospect.email}:`, error);
            return { success: false, prospect: prospect.email, error: error.message };
          }
        })
      );

      const successful = results.filter((r: any) => r.success).length;
      const failed = results.filter((r: any) => !r.success).length;
      const duplicates = results.filter((r: any) => !r.success && r.duplicate).length;
      const nextSent = results.filter((r: any) => r.success && r.nextSent).length;

      let statusMessage = '';
      if (failed > 0) {
        if (duplicates > 0) {
          if (nextSent > 0) {
            statusMessage = `Envoyé à ${successful - nextSent} prospects. ${nextSent} prospects ont reçu le template suivant. ${duplicates} templates déjà envoyés.`;
          } else {
            statusMessage = `Envoyé à ${successful} prospects. ${duplicates} templates déjà envoyés.`;
          }
        } else {
          statusMessage = `Envoyé à ${successful} prospects, échec pour ${failed} prospects.`;
        }

        if (nextSent > 0) {
          addNotification('info', `${nextSent} prospects ont reçu le template suivant automatiquement.`);
        }

        if (duplicates > 0) {
          addNotification('warning', `${duplicates} emails n'ont pas été envoyés car les templates avaient déjà été utilisés.`);
        }

        setError(statusMessage);

        if (successful > 0) {
          addNotification('success', `Email envoyé avec succès à ${successful} prospects!`);
          setTestEmailStatus('success');
        } else {
          setTestEmailStatus('error');
        }
      } else {
        addNotification('success', `Email envoyé avec succès à ${successful} prospects!`);
        setTestEmailStatus('success');
      }

      setTimeout(() => {
        setTestEmailStatus('idle');
        setTestingTemplateId(null);
      }, 3000);
    } catch (error: any) {
      console.error('Error sending test emails:', error);
      setError(error.message);
      setTestEmailStatus('error');
      addNotification('error', `Erreur: ${error.message}`);
      setTimeout(() => {
        setTestEmailStatus('idle');
        setTestingTemplateId(null);
      }, 3000);
    }
  };

  // Fonction pour envoyer le template suivant
  const sendNextTemplate = async (prospect_id: string, currentStage: number) => {
    try {
      // Trouver le template de l'étape suivante
      const nextStage = currentStage + 1;
      const nextTemplate = templates.find(t => t.stage === nextStage);

      if (!nextTemplate) {
        addNotification('warning', 'Aucun template disponible pour l\'étape suivante.');
        return false;
      }

      // Récupérer les informations du prospect
      const { data: prospect, error: prospectError } = await supabase
        .from('prospects')
        .select('*')
        .eq('id', prospect_id)
        .single();

      if (prospectError) throw prospectError;

      // Récupérer les paramètres d'email
      const { data: settings, error: settingsError } = await supabase
        .from('settings')
        .select('email_provider, email_api_key')
        .eq('user_id', user?.id)
        .single();

      if (settingsError) throw settingsError;

      // Envoyer l'email avec le template suivant
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email-direct`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email_provider: settings.email_provider,
            email_api_key: settings.email_api_key,
            to: prospect.email,
            name: prospect.name,
            project: prospect.project || 'votre entreprise',
            company: prospect.company || 'votre entreprise',
            subject: nextTemplate.subject,
            html: nextTemplate.body,
            prospect_id: prospect.id,
            template_id: nextTemplate.id,
            user_id: user?.id
          })
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        if (responseData.duplicate) {
          addNotification('warning', `Ce template a déjà été envoyé à ce prospect.`);
          return false;
        }
        throw new Error(responseData.error || 'Failed to send email');
      }

      addNotification('success', `Email envoyé avec succès à ${prospect.name} (template étape ${nextStage})`);
      return true;
    } catch (error: any) {
      console.error('Error sending next template:', error);
      addNotification('error', `Impossible d'envoyer le template suivant: ${error.message}`);
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchTemplates();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Email Templates</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Create and manage your follow-up email templates
          </p>
        </div>
        <button
          onClick={() => setEditingId('new')}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:-translate-y-0.5 shadow-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </button>
      </div>

      {error && (
        <div className={`mb-4 flex items-center p-4 rounded-lg ${error.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
          }`}>
          {error.includes('success') ? (
            <Check className="h-5 w-5 mr-2" />
          ) : (
            <AlertCircle className="h-5 w-5 mr-2" />
          )}
          {error}
        </div>
      )}

      {/* Affichage des notifications */}
      {notifications.map(notification => (
        <NotificationMessage
          key={notification.id}
          type={notification.type}
          message={notification.message}
          onClose={() => removeNotification(notification.id)}
        />
      ))}

      <div className="grid grid-cols-1 gap-6">
        {/* Formulaire de création */}
        {editingId === 'new' && (
          <TemplateForm
            isNew={true}
            onSave={handleSave}
            onCancel={() => setEditingId(null)}
          />
        )}

        {/* Cartes de templates - affichage ou édition */}
        {templates.map((template) => (
          editingId === template.id ? (
            <TemplateForm
              key={template.id}
              isNew={false}
              initialData={{
                name: template.name,
                stage: template.stage,
                subject: template.subject,
                body: template.body
              }}
              onSave={handleSave}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <TemplateCard
              key={template.id}
              template={template}
              onEdit={() => handleEdit(template.id)}
              onDelete={() => openDeleteModal(template)}
              onSendTest={handleTestEmail}
              onSendAll={handleTestAllProspects}
              isSendingTest={testEmailStatus === 'sending' && testingTemplateId === template.id}
              testStatus={testingTemplateId === template.id ? testEmailStatus : 'idle'}
            >
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(template.id)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center transition-colors"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Modifier
                </button>
                <button
                  onClick={() => openDeleteModal(template)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center transition-colors"
                >
                  <Trash className="w-3 h-3 mr-1" />
                  Supprimer
                </button>
              </div>
            </TemplateCard>
          )
        ))}
      </div>

      {/* Modale de confirmation de suppression */}
      {templateToDelete && (
        <Modal isOpen={isModalOpen} onClose={closeDeleteModal}>
          <h2 className="text-xl font-semibold mb-4">Confirmer la Suppression</h2>
          <p className="mb-6">Êtes-vous sûr de vouloir supprimer le template "{templateToDelete.name}" (Étape {templateToDelete.stage}) ? Cette action est irréversible.</p>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={closeDeleteModal}>Annuler</Button>
            <Button variant="destructive" onClick={confirmDelete}>Supprimer</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Templates;