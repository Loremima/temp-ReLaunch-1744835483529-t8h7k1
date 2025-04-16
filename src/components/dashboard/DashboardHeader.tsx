import React, { useEffect, useState } from 'react';
import { Mail, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface DashboardHeaderProps {
    userName: string;
    onSendEmails: () => void;
}

/**
 * En-tête du tableau de bord avec titre et bouton d'action
 */
const DashboardHeader: React.FC<DashboardHeaderProps> = ({
    userName,
    onSendEmails
}) => {
    const [automationActive, setAutomationActive] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            fetchAutomationStatus();
        }
    }, [user]);

    const fetchAutomationStatus = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('is_active')
                .eq('user_id', user?.id)
                .single();

            if (error) throw error;
            setAutomationActive(data?.is_active || false);
        } catch (error) {
            console.error('Erreur lors de la récupération du statut d\'automatisation:', error);
        }
    };

    const handleAutomationClick = () => {
        navigate('/app/settings/automation');
    };

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 space-y-4 md:space-y-0">
            <div className="max-w-3xl">
                <div className="flex items-center">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                        Tableau de bord
                    </h1>
                    {automationActive && (
                        <button
                            onClick={handleAutomationClick}
                            className="ml-4 flex items-center bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs px-3 py-1 rounded-full border border-green-200 dark:border-green-800/60"
                        >
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            Automatisation active
                        </button>
                    )}
                </div>
                <p className="text-gray-600 dark:text-blue-200 mt-2 text-lg font-light leading-relaxed">
                    Bonjour <span className="font-medium text-blue-600 dark:text-blue-300">{userName || 'Utilisateur'}</span>, voici un aperçu de votre activité de relance 📊
                </p>
            </div>
            <button
                onClick={onSendEmails}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl px-6 py-3 font-medium flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
                <Mail className="h-5 w-5 mr-2" />
                <span>Envoyer emails</span>
                <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </button>
        </div>
    );
};

export default DashboardHeader; 