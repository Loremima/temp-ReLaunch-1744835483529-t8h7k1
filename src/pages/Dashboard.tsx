import React, { useState, useEffect } from 'react';
import { Mail, BarChart, RefreshCw, Plus, AlertCircle, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useDashboard } from '../hooks';
import StatCard from '../components/dashboard/StatCard';
import ActivityChart from '../components/dashboard/ActivityChart';
import UpcomingFollowups from '../components/dashboard/UpcomingFollowups';
import ConversionRates from '../components/dashboard/ConversionRates';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { SupportButton } from '../components/common/SupportButton';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);
  const [userName, setUserName] = useState<string>('');

  const {
    stats,
    chartData,
    loading,
    error,
    upcomingFollowups,
    fetchDashboardData,
    conversionRate
  } = useDashboard();

  // Récupérer le nom d'utilisateur depuis les paramètres du compte
  useEffect(() => {
    if (user?.id) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, first_name')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération du profil:', error);
        // Fallback aux métadonnées de l'utilisateur
        setUserName(user?.user_metadata?.name || 'utilisateur');
      } else if (data) {
        // Utiliser le nom complet s'il existe, sinon le prénom, sinon les métadonnées
        setUserName(data.full_name || data.first_name || user?.user_metadata?.name || 'utilisateur');
      }
    } catch (error) {
      console.error('Erreur inattendue:', error);
      setUserName(user?.user_metadata?.name || 'utilisateur');
    }
  };

  // Gérer les erreurs
  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white dark:bg-gray-800/70 backdrop-blur-sm p-8 rounded-2xl shadow-sm mb-6 border border-gray-100 dark:border-blue-900/20">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Tableau de bord</h1>
          <div className="bg-red-50 dark:bg-red-900/20 p-5 rounded-xl border border-red-100 dark:border-red-900/30 flex items-start">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-3 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-700 dark:text-red-400 font-medium">
                {error}
              </p>
              <button
                onClick={() => fetchDashboardData()}
                className="mt-2 inline-flex items-center text-sm text-red-600 dark:text-red-300 hover:text-red-800 dark:hover:text-red-200 font-medium"
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Afficher un loader pendant le chargement des données
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 flex justify-center items-center min-h-[70vh]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600 dark:text-blue-200 text-sm font-medium">Chargement des données...</p>
        </div>
      </div>
    );
  }

  // Ouvrir la fenêtre de confirmation d'envoi d'emails
  const handleSendEmails = () => {
    setIsModalOpen(true);
  };

  // Fermer la fenêtre de confirmation
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Confirmer l'envoi d'emails à tous les prospects
  const handleConfirmSend = async () => {
    setIsSending(true);
    try {
      // Récupérer les templates disponibles
      const { data: templates, error: templatesError } = await supabase
        .from('templates')
        .select('*')
        .eq('user_id', user?.id)
        .order('stage', { ascending: true });

      if (templatesError) throw templatesError;

      if (!templates || templates.length === 0) {
        setSendResult({
          success: false,
          message: "Aucun template disponible pour l'envoi d'emails."
        });
        setIsSending(false);
        return;
      }

      // Récupérer tous les prospects actifs
      const { data: prospects, error: prospectsError } = await supabase
        .from('prospects')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'Pending');

      if (prospectsError) throw prospectsError;

      if (!prospects || prospects.length === 0) {
        setSendResult({
          success: false,
          message: "Aucun prospect actif disponible pour l'envoi d'emails."
        });
        setIsSending(false);
        return;
      }

      // Récupérer les paramètres d'email
      const { data: settings, error: settingsError } = await supabase
        .from('settings')
        .select('email_provider, email_api_key')
        .eq('user_id', user?.id)
        .single();

      if (settingsError) throw settingsError;

      // Envoyer un email à chaque prospect avec le template correspondant à son étape
      const results = await Promise.all(
        prospects.map(async (prospect) => {
          // Trouver le template correspondant à l'étape du prospect
          const template = templates.find(t => t.stage === prospect.followup_stage) || templates[0];

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
                  email_provider: settings.email_provider,
                  email_api_key: settings.email_api_key,
                  to: prospect.email,
                  name: prospect.name,
                  company: prospect.company || 'votre entreprise',
                  subject: template.subject,
                  html: template.body,
                  prospect_id: prospect.id,
                  template_id: template.id,
                  user_id: user?.id
                })
              }
            );

            const responseData = await response.json();
            return {
              success: response.ok,
              prospect: prospect.email,
              error: !response.ok ? responseData.message || 'Échec de l\'envoi' : null,
              duplicate: responseData.duplicate || false
            };
          } catch (error) {
            return {
              success: false,
              prospect: prospect.email,
              error: error instanceof Error ? error.message : 'Erreur inconnue'
            };
          }
        })
      );

      // Calculer les résultats
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      const duplicates = results.filter(r => r.duplicate).length;

      setSendResult({
        success: successful > 0,
        message: `${successful} emails envoyés avec succès, ${failed} échecs${duplicates > 0 ? `, ${duplicates} déjà envoyés` : ''}.`
      });

      // Rafraîchir les données du dashboard
      fetchDashboardData();
    } catch (error) {
      setSendResult({
        success: false,
        message: `Erreur lors de l'envoi des emails: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      });
    } finally {
      setIsSending(false);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        userName={userName}
        onSendEmails={handleSendEmails}
      />
      <div className="container mx-auto px-4 py-8">
        {/* Résultat de l'envoi d'emails */}
        {sendResult && (
          <div className={`mb-8 px-6 py-4 rounded-xl border backdrop-blur-sm shadow-sm flex items-start justify-between
            ${sendResult.success
              ? 'bg-green-50/90 dark:bg-green-900/30 border-green-200 dark:border-green-900/50 text-green-800 dark:text-green-300'
              : 'bg-red-50/90 dark:bg-red-900/30 border-red-200 dark:border-red-900/50 text-red-800 dark:text-red-300'}`}>
            <div className="flex items-center">
              <span className={`mr-3 flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${sendResult.success ? 'bg-green-100 dark:bg-green-800/50' : 'bg-red-100 dark:bg-red-800/50'
                }`}>
                {sendResult.success
                  ? <Mail className="h-4 w-4 text-green-600 dark:text-green-200" />
                  : <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-200" />}
              </span>
              <p className="text-sm font-medium">{sendResult.message}</p>
            </div>
            <button
              onClick={() => setSendResult(null)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 ml-4 flex-shrink-0"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Statistiques générales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={BarChart}
            title="Prospects actifs"
            value={stats.activeProspects}
            color="blue"
            trend={stats.prospectsChange ? { value: Math.abs(stats.prospectsChange), positive: stats.prospectsChange >= 0 } : undefined}
            description="Prospects en attente de réponse"
          />
          <StatCard
            icon={RefreshCw}
            title="Taux de réponse"
            value={`${stats.responseRate.toFixed(1)}%`}
            color="green"
            trend={stats.responseRateChange ? { value: Math.abs(stats.responseRateChange), positive: stats.responseRateChange >= 0 } : undefined}
            description="Basé sur votre historique d'envoi"
          />
          <StatCard
            icon={Plus}
            title="Relances en attente"
            value={stats.pendingFollowups}
            color="yellow"
            trend={stats.pendingFollowupsChange ? { value: Math.abs(stats.pendingFollowupsChange), positive: stats.pendingFollowupsChange >= 0 } : undefined}
            description="Relances prévues aujourd'hui"
          />
        </div>

        {/* Statistiques d'envoi d'email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-blue-900/20">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">Statistiques d'envoi</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-5 border border-blue-100 dark:border-blue-900/30">
                <div className="text-sm text-blue-700 dark:text-blue-300 font-medium mb-1">Aujourd'hui</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.emailsSentToday}</div>
                <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">emails envoyés</div>
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-5 border border-indigo-100 dark:border-indigo-900/30">
                <div className="text-sm text-indigo-700 dark:text-indigo-300 font-medium mb-1">Cette semaine</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.emailsSentThisWeek}</div>
                <div className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">emails envoyés</div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-5 border border-purple-100 dark:border-purple-900/30">
                <div className="text-sm text-purple-700 dark:text-purple-300 font-medium mb-1">Taux d'ouverture</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.openRate}%</div>
                <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">en moyenne</div>
              </div>
              <div className="bg-pink-50 dark:bg-pink-900/20 rounded-xl p-5 border border-pink-100 dark:border-pink-900/30">
                <div className="text-sm text-pink-700 dark:text-pink-300 font-medium mb-1">Total</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalEmails}</div>
                <div className="text-xs text-pink-600 dark:text-pink-400 mt-1">emails envoyés</div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-blue-900/20">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">Prospects par étape</h2>
            {stats.prospectsByStage.length > 0 ? (
              <div className="space-y-4">
                {stats.prospectsByStage.map((item, index) => (
                  <div key={index} className="relative">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Étape {item.stage}
                      </span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {item.count} prospects
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                        style={{ width: `${Math.min(100, (item.count / Math.max(...stats.prospectsByStage.map(s => s.count))) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-3 mb-4">
                  <BarChart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 max-w-xs">
                  Aucune donnée disponible. Ajoutez des prospects à différentes étapes pour voir les statistiques ici.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Activité des 7 derniers jours */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-7 gap-8">
          <div className="md:col-span-4 bg-white dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-blue-900/20">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">
              Activité des 7 derniers jours
            </h2>
            <div className="h-64">
              <ActivityChart data={chartData} />
            </div>
          </div>

          <div className="md:col-span-3 bg-white dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-blue-900/20">
            <div className="h-full">
              <ConversionRates openRate={stats.openRate} clickRate={stats.clickRate} conversionRate={conversionRate} />
            </div>
          </div>
        </div>

        {/* Fenêtre modale de confirmation */}
        <ConfirmationModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onConfirm={handleConfirmSend}
          title="Envoyer des emails à tous les prospects ?"
          message="Cela enverra un email à chaque prospect actif en fonction de son étape de relance. Voulez-vous continuer ?"
          confirmText="Envoyer"
          cancelText="Annuler"
          isProcessing={isSending}
        />
      </div>
      <SupportButton />
    </div>
  );
};

export default Dashboard;