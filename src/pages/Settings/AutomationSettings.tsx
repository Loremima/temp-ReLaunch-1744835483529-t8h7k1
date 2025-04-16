import React, { useState, useEffect } from 'react';
import { Clock, Calendar, ToggleLeft, ToggleRight, Info, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function AutomationSettings() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [isActive, setIsActive] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [executions, setExecutions] = useState<any[]>([]);
    const [loadingLogs, setLoadingLogs] = useState(false);

    useEffect(() => {
        if (user) {
            fetchSettings();
            fetchExecutionLogs();
        }
    }, [user]);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('is_active')
                .eq('user_id', user?.id)
                .single();

            if (error) throw error;
            setIsActive(data?.is_active || false);
        } catch (error) {
            console.error('Erreur lors de la récupération des paramètres:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchExecutionLogs = async () => {
        try {
            setLoadingLogs(true);
            const { data, error } = await supabase
                .from('scheduled_job_logs')
                .select('*')
                .eq('job_type', 'email_sending')
                .order('executed_at', { ascending: false })
                .limit(10);

            if (error) throw error;
            setExecutions(data || []);
        } catch (error) {
            console.error('Erreur lors de la récupération des logs:', error);
        } finally {
            setLoadingLogs(false);
        }
    };

    const toggleAutomation = async () => {
        try {
            setIsUpdating(true);
            const newStatus = !isActive;

            const { error } = await supabase
                .from('profiles')
                .update({ is_active: newStatus })
                .eq('user_id', user?.id);

            if (error) throw error;
            setIsActive(newStatus);
        } catch (error) {
            console.error('Erreur lors de la mise à jour des paramètres:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Paramètres d'automatisation */}
            <div className="bg-white dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-blue-900/20">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                            <Clock className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                        </div>
                        <h2 className="text-lg font-medium text-gray-900 dark:text-white">Automatisation des emails</h2>
                    </div>
                </div>

                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/30">
                    <div className="flex items-start">
                        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-blue-700 dark:text-blue-300">
                            <p className="mb-2">
                                Activez cette option pour envoyer automatiquement des emails à vos prospects selon leur étape de relance.
                            </p>
                            <p>
                                Les emails seront envoyés deux fois par jour : à 9h et à 16h.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700/30">
                    <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        <div>
                            <span className="font-medium text-gray-900 dark:text-white">Envoi automatique d'emails</span>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Envoie automatiquement des emails à vos prospects
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={toggleAutomation}
                        disabled={loading || isUpdating}
                        className="relative inline-flex items-center justify-center focus:outline-none"
                    >
                        {isUpdating ? (
                            <RefreshCw className="h-6 w-6 text-blue-500 dark:text-blue-400 animate-spin" />
                        ) : isActive ? (
                            <ToggleRight className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                        ) : (
                            <ToggleLeft className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                        )}
                    </button>
                </div>
            </div>

            {/* Historique des exécutions */}
            <div className="bg-white dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-blue-900/20">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                            <Clock className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                        </div>
                        <h2 className="text-lg font-medium text-gray-900 dark:text-white">Historique des envois automatiques</h2>
                    </div>
                    <button
                        onClick={fetchExecutionLogs}
                        disabled={loadingLogs}
                        className="px-4 py-2 bg-white dark:bg-blue-900/20 border border-gray-300 dark:border-blue-700/50 rounded-xl hover:bg-gray-50 dark:hover:bg-blue-800/30 text-sm font-medium text-gray-700 dark:text-blue-200 transition-colors flex items-center"
                    >
                        {loadingLogs ? (
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <RefreshCw className="h-4 w-4 mr-2" />
                        )}
                        Actualiser
                    </button>
                </div>

                {loadingLogs ? (
                    <div className="flex justify-center items-center h-48">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : executions.length === 0 ? (
                    <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                        <p>Aucune exécution n'a été enregistrée</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {executions.map((execution) => (
                            <div
                                key={execution.id}
                                className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700/30"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 mr-3">
                                            {execution.results.success > 0 ? (
                                                <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
                                            ) : (
                                                <XCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="text-gray-900 dark:text-white font-medium">
                                                Exécution du {format(new Date(execution.executed_at), 'PPP à HH:mm', { locale: fr })}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                {execution.results.success} emails envoyés, {execution.results.failed} échecs, {execution.results.duplicates} déjà envoyés
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {execution.results.details && execution.results.details.length > 0 && (
                                    <div className="mt-3 text-sm">
                                        <div className="font-medium text-gray-700 dark:text-gray-300 mb-2">Détails:</div>
                                        <div className="space-y-2">
                                            {execution.results.details.map((detail: any, index: number) => (
                                                <div key={index} className="px-3 py-2 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-800 dark:text-gray-200">Utilisateur: {detail.user_id}</span>
                                                        {detail.error ? (
                                                            <span className="text-red-600 dark:text-red-400">{detail.error}</span>
                                                        ) : (
                                                            <span className="text-green-600 dark:text-green-400">
                                                                {detail.prospects_processed} prospects traités
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
} 