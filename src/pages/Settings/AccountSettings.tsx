import React, { useState, useEffect } from 'react';
import { User, CreditCard, Package, Receipt, CheckCircle, AlertCircle, ArrowRight, X, AlertTriangle, Bug } from 'lucide-react';
import { useUser, useSubscription } from '../../hooks';
import { supabase } from '../../lib/supabase';
import { useLocation } from 'react-router-dom';

export default function AccountSettings() {
  const location = useLocation();
  const { loading: userLoading } = useUser();
  const {
    subscription,
    loading: subscriptionLoading,
    cancelSubscription,
    resumeSubscription,
    changeSubscription
  } = useSubscription();

  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [loadingCancel, setLoadingCancel] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<{
    type: 'success' | 'error' | 'info' | null;
    message: string | null;
  }>({ type: null, message: null });

  // Vérifier les paramètres d'URL pour les redirections après le paiement
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('checkout') === 'success') {
      setUpdateStatus({
        type: 'success',
        message: 'Votre abonnement a été mis à jour avec succès'
      });
    } else if (params.get('update') === 'success') {
      setUpdateStatus({
        type: 'success',
        message: 'Votre forfait a été modifié avec succès'
      });
    }
  }, [location]);

  // Fonction pour initialiser le paiement avec Stripe
  const handleSubscribe = async (plan: string) => {
    setLoadingCheckout(true);
    setUpdateStatus({ type: null, message: null });
    console.log('Démarrage de la souscription au plan:', plan);

    try {
      console.log('Appel de la fonction create-checkout avec plan:', plan);
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          plan,
          returnUrl: window.location.origin + '/app/settings/account?checkout=success'
        }
      });

      if (error) {
        console.error('Erreur lors de l\'invocation de create-checkout:', error);
        throw error;
      }

      console.log('Réponse de create-checkout:', data);
      if (data?.url) {
        console.log('Redirection vers l\'URL de paiement:', data.url);
        window.location.href = data.url;
      } else {
        console.error('URL de paiement manquante dans la réponse');
        throw new Error('Aucune URL de paiement reçue');
      }
    } catch (error: any) {
      console.error('Erreur complète lors de la création du paiement:', error);
      setUpdateStatus({
        type: 'error',
        message: error.message || 'Erreur lors de la création du paiement'
      });
      setLoadingCheckout(false);
    }
  };

  // Fonction pour gérer le changement d'abonnement
  const handleChangeSubscription = async (newPlan: 'pro' | 'business') => {
    setLoadingCheckout(true);
    setUpdateStatus({ type: null, message: null });

    try {
      const result = await changeSubscription(newPlan);

      if (!result.success) {
        throw new Error(result.error);
      }

      if (result.url) {
        window.location.href = result.url;
      } else {
        throw new Error('Aucune URL de modification reçue');
      }
    } catch (error: any) {
      setUpdateStatus({
        type: 'error',
        message: error.message || 'Erreur lors de la modification de l\'abonnement'
      });
      setLoadingCheckout(false);
    }
  };

  // Fonction pour annuler l'abonnement
  const handleCancelSubscription = async () => {
    setLoadingCancel(true);
    setUpdateStatus({ type: null, message: null });

    try {
      const result = await cancelSubscription();

      if (!result.success) {
        throw new Error(result.error);
      }

      setUpdateStatus({
        type: 'success',
        message: 'Votre abonnement sera annulé à la fin de la période en cours'
      });

      setShowCancelModal(false);
    } catch (error: any) {
      setUpdateStatus({
        type: 'error',
        message: error.message || 'Erreur lors de l\'annulation de l\'abonnement'
      });
    } finally {
      setLoadingCancel(false);
    }
  };

  // Fonction pour reprendre un abonnement marqué pour annulation
  const handleResumeSubscription = async () => {
    setLoadingCancel(true);
    setUpdateStatus({ type: null, message: null });

    try {
      const result = await resumeSubscription();

      if (!result.success) {
        throw new Error(result.error);
      }

      setUpdateStatus({
        type: 'success',
        message: 'Votre abonnement a été rétabli avec succès'
      });
    } catch (error: any) {
      setUpdateStatus({
        type: 'error',
        message: error.message || 'Erreur lors du rétablissement de l\'abonnement'
      });
    } finally {
      setLoadingCancel(false);
    }
  };

  // Formatage de la date de fin de période
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Non disponible';

    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  // Obtenir le texte du plan
  const getPlanText = (plan: string | null) => {
    switch (plan) {
      case 'free': return 'Solopreneur';
      case 'pro': return 'Pro';
      case 'business': return 'Enterprise';
      default: return 'Non disponible';
    }
  };

  // Fonction pour tester l'appel direct à la fonction Edge
  const testEdgeFunction = async () => {
    try {
      const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://vreiwasrkwssyskooimu.supabase.co';
      const session = await supabase.auth.getSession();
      const accessToken = session.data?.session?.access_token || '';

      const response = await fetch(`${supabaseUrl}/functions/v1/create-checkout`, {
        method: 'OPTIONS',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      console.log('Test CORS preflight response:', response);
      console.log('Status:', response.status);
      console.log('Headers:', [...response.headers.entries()]);

      alert(`Test CORS preflight: ${response.status} ${response.statusText}`);
    } catch (error: any) {
      console.error('Erreur lors du test CORS:', error);
      alert(`Erreur CORS: ${error.message}`);
    }
  };

  // Afficher un état de chargement
  if (userLoading || subscriptionLoading) {
    return (
      <div className="space-y-8">
        <div className="bg-white dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-blue-900/20">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-900/30">
              <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
            <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* DEBUG: Bouton de test caché */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={testEdgeFunction}
          className="bg-gray-800 text-white p-2 rounded-full opacity-30 hover:opacity-100"
          title="Tester les fonctions Edge"
        >
          <Bug className="h-5 w-5" />
        </button>
      </div>

      {/* Notification de statut */}
      {updateStatus.type && (
        <div className={`px-4 py-3 rounded-xl flex items-center ${updateStatus.type === 'success'
          ? 'bg-green-50 dark:bg-green-900/30 border border-green-100 dark:border-green-900/40 text-green-800 dark:text-green-300'
          : updateStatus.type === 'error'
            ? 'bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-900/40 text-red-800 dark:text-red-300'
            : 'bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-900/40 text-blue-800 dark:text-blue-300'
          }`}>
          {updateStatus.type === 'success' ? (
            <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          ) : updateStatus.type === 'error' ? (
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          )}
          <span className="text-sm">{updateStatus.message}</span>
        </div>
      )}

      {/* Abonnement actuel */}
      <div className="bg-white dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-blue-900/20">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/30">
            <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-300" />
          </div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Abonnement actuel</h2>
        </div>

        {subscriptionLoading ? (
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
          </div>
        ) : subscription && subscription.plan ? (
          <>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700/30 p-5 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Forfait</p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                    {getPlanText(subscription.plan)}
                    {subscription.plan !== 'free' && subscription.cancel_at_period_end && (
                      <span className="ml-2 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 rounded text-xs font-medium">
                        Non renouvelé
                      </span>
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Statut</p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                    {subscription.status === 'active' ? (
                      <span className="flex items-center text-green-600 dark:text-green-400">
                        <span className="h-2 w-2 rounded-full bg-green-500 dark:bg-green-400 mr-2"></span>
                        Actif
                      </span>
                    ) : subscription.status === 'past_due' ? (
                      <span className="flex items-center text-red-600 dark:text-red-400">
                        <span className="h-2 w-2 rounded-full bg-red-500 dark:bg-red-400 mr-2"></span>
                        En retard de paiement
                      </span>
                    ) : (
                      <span className="flex items-center text-gray-600 dark:text-gray-400">
                        <span className="h-2 w-2 rounded-full bg-gray-500 dark:bg-gray-400 mr-2"></span>
                        {subscription.status || 'Inconnu'}
                      </span>
                    )}
                  </p>
                </div>

                {subscription.plan !== 'free' && (
                  <>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Date de renouvellement</p>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        {formatDate(subscription.current_period_end)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Prochain prélèvement</p>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        {subscription.cancel_at_period_end
                          ? 'Aucun - L\'abonnement ne sera pas renouvelé'
                          : subscription.plan === 'pro'
                            ? '€79,00'
                            : '€129,00'}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              {subscription.plan !== 'free' ? (
                subscription.cancel_at_period_end ? (
                  <button
                    onClick={handleResumeSubscription}
                    disabled={loadingCancel}
                    className="px-4 py-2 border border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl text-sm font-medium transition-colors flex items-center justify-center"
                  >
                    {loadingCancel ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full mr-2"></div>
                        Chargement...
                      </>
                    ) : 'Réactiver mon abonnement'}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setShowCancelModal(true)}
                      disabled={loadingCancel}
                      className="px-4 py-2 border border-red-500 dark:border-red-400 text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-sm font-medium transition-colors flex items-center justify-center"
                    >
                      {loadingCancel ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-red-600 dark:border-red-400 border-t-transparent rounded-full mr-2"></div>
                          Chargement...
                        </>
                      ) : 'Annuler mon abonnement'}
                    </button>

                    {subscription.plan === 'pro' && (
                      <button
                        onClick={() => handleChangeSubscription('business')}
                        disabled={loadingCheckout}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center"
                      >
                        {loadingCheckout ? (
                          <>
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                            Chargement...
                          </>
                        ) : (
                          <>
                            Passer au forfait Business
                            <ArrowRight className="h-4 w-4 ml-1.5" />
                          </>
                        )}
                      </button>
                    )}

                    {subscription.plan === 'business' && (
                      <button
                        onClick={() => handleChangeSubscription('pro')}
                        disabled={loadingCheckout}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center"
                      >
                        {loadingCheckout ? (
                          <>
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                            Chargement...
                          </>
                        ) : 'Passer au forfait Pro'}
                      </button>
                    )}
                  </>
                )
              ) : (
                <>
                  <button
                    onClick={() => handleSubscribe('pro')}
                    disabled={loadingCheckout}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center"
                  >
                    {loadingCheckout ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Chargement...
                      </>
                    ) : 'Passer au forfait Pro'}
                  </button>
                  <button
                    onClick={() => handleSubscribe('business')}
                    disabled={loadingCheckout}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center"
                  >
                    {loadingCheckout ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Chargement...
                      </>
                    ) : 'Passer au forfait Business'}
                  </button>
                </>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800/30 p-5 mb-6">
              <p className="text-amber-800 dark:text-amber-300 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
                Impossible de récupérer les informations d'abonnement. Utilisez les boutons ci-dessous pour souscrire à un forfait.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <button
                onClick={() => handleSubscribe('pro')}
                disabled={loadingCheckout}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center"
              >
                {loadingCheckout ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Chargement...
                  </>
                ) : 'Souscrire au forfait Pro'}
              </button>
              <button
                onClick={() => handleSubscribe('business')}
                disabled={loadingCheckout}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center"
              >
                {loadingCheckout ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Chargement...
                  </>
                ) : 'Souscrire au forfait Business'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Modale de confirmation d'annulation */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/30 mr-4">
                <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-300" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white">Annuler votre abonnement</h3>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Êtes-vous sûr de vouloir annuler votre abonnement ? Vous pourrez continuer à utiliser votre forfait {getPlanText(subscription?.plan || null)} jusqu'au {formatDate(subscription?.current_period_end || null)}.
            </p>

            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-xl text-sm font-medium transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={loadingCancel}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors flex items-center"
              >
                {loadingCancel ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Chargement...
                  </>
                ) : 'Confirmer l\'annulation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Plans */}
      <div className="bg-white dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-blue-900/20">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-900/30">
            <Package className="h-5 w-5 text-purple-600 dark:text-purple-300" />
          </div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Forfaits et abonnements</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Forfait Gratuit */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 flex flex-col h-full bg-gray-50 dark:bg-gray-800/50">
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-md text-xs font-medium">Solopreneur</span>
            </div>
            <div className="mb-4">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">€0</span>
              <span className="text-gray-500 dark:text-gray-400">/mois</span>
            </div>
            <ul className="space-y-2 mb-6 flex-grow">
              <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 mr-2 flex-shrink-0" />
                <span>5 relances par mois</span>
              </li>
              <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 mr-2 flex-shrink-0" />
                <span>10 contacts maximum</span>
              </li>
            </ul>
            <button
              disabled
              className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed"
            >
              Plan actuel
            </button>
          </div>

          {/* Forfait Pro */}
          <div className="border border-blue-500 dark:border-blue-600 rounded-xl p-5 flex flex-col h-full bg-blue-50 dark:bg-blue-900/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-blue-500 dark:bg-blue-600 text-white px-3 py-1 text-xs font-medium transform translate-y-0 translate-x-0">POPULAIRE</div>
            <div className="mb-4 pt-4">
              <span className="inline-block px-3 py-1 bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-md text-xs font-medium">PRO</span>
            </div>
            <div className="mb-4">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">€79</span>
              <span className="text-gray-500 dark:text-gray-400">/mois</span>
            </div>
            <ul className="space-y-2 mb-6 flex-grow">
              <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 mr-2 flex-shrink-0" />
                <span>Relances illimitées</span>
              </li>
              <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 mr-2 flex-shrink-0" />
                <span>1 000 contacts</span>
              </li>
              <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 mr-2 flex-shrink-0" />
                <span>Assistance prioritaire</span>
              </li>
              <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 mr-2 flex-shrink-0" />
                <span>Personnalisation avancée</span>
              </li>
            </ul>
            <button
              onClick={() => window.location.href = 'https://buy.stripe.com/test_5kAaG50Uq4yQcHm144'}
              disabled={loadingCheckout}
              className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center"
            >
              {loadingCheckout ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Chargement...
                </>
              ) : 'Souscrire'}
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">Paiement sécurisé par Stripe</p>
          </div>

          {/* Forfait Enterprise */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 flex flex-col h-full bg-gray-50 dark:bg-gray-800/50">
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 rounded-md text-xs font-medium">ENTERPRISE</span>
            </div>
            <div className="mb-4">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">€129</span>
              <span className="text-gray-500 dark:text-gray-400">/mois</span>
            </div>
            <ul className="space-y-2 mb-6 flex-grow">
              <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 mr-2 flex-shrink-0" />
                <span>Relances illimitées</span>
              </li>
              <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 mr-2 flex-shrink-0" />
                <span>Contacts illimités</span>
              </li>
              <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 mr-2 flex-shrink-0" />
                <span>Utilisateurs multiples</span>
              </li>
              <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 mr-2 flex-shrink-0" />
                <span>API avancée</span>
              </li>
              <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 mr-2 flex-shrink-0" />
                <span>Analyse IA des réponses</span>
              </li>
              <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 mr-2 flex-shrink-0" />
                <span>Génération de relances personnalisées</span>
              </li>
              <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 mr-2 flex-shrink-0" />
                <span>Gestion des équipes</span>
              </li>
            </ul>
            <button
              onClick={() => window.location.href = 'https://buy.stripe.com/test_00g5lLfPkd5maze7st'}
              disabled={loadingCheckout}
              className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center"
            >
              {loadingCheckout ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-gray-600 dark:border-gray-400 border-t-transparent rounded-full mr-2"></div>
                  Chargement...
                </>
              ) : 'Souscrire'}
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">Paiement sécurisé par Stripe</p>
          </div>
        </div>
      </div>

      {/* Tableau comparatif */}
      <div className="bg-white dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-blue-900/20 overflow-hidden">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-900/30">
            <Receipt className="h-5 w-5 text-purple-600 dark:text-purple-300" />
          </div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Comparaison des forfaits</h2>
        </div>

        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fonctionnalité</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Solopreneur</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pro</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Enterprise</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">Relances</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">5 / mois</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Illimitées</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Illimitées</td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">Contacts</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">10</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">1 000</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Illimités</td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">Utilisateurs</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">1</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">1</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Illimités</td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">Support</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Email</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Prioritaire</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Dédié</td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">Analyse IA</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Non</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Basique</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Avancée</td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">Génération de messages</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Modèles basiques</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Personnalisable</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">IA contextuelle</td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">Prédiction de réponse</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Non</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Non</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Oui</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}