import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export interface ProspectPreview {
    id: string;
    name: string;
    email: string;
    project: string | null;
    next_followup: string;
}

interface UpcomingFollowupsProps {
    prospects: ProspectPreview[];
    onViewAll?: () => void;
}

/**
 * Affiche la liste des prochaines relances avec leur date
 */
const UpcomingFollowups: React.FC<UpcomingFollowupsProps> = ({ prospects, onViewAll }) => {
    return (
        <div className="space-y-4">
            {prospects.length > 0 ? (
                prospects.map((prospect) => {
                    // Formater la date
                    const followupDate = new Date(prospect.next_followup);
                    const today = new Date();
                    const tomorrow = new Date();
                    tomorrow.setDate(today.getDate() + 1);

                    let dateText = format(followupDate, 'dd/MM/yyyy', { locale: fr });
                    // Afficher un texte spécifique pour aujourd'hui ou demain
                    if (format(followupDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
                        dateText = 'Aujourd\'hui';
                    } else if (format(followupDate, 'yyyy-MM-dd') === format(tomorrow, 'yyyy-MM-dd')) {
                        dateText = 'Demain';
                    }

                    // Déterminer l'urgence (rouge pour aujourd'hui, normal sinon)
                    const isUrgent = format(followupDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');

                    return (
                        <div key={prospect.id} className="followup-item flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700/30 last:border-0">
                            <div className="flex items-center">
                                <div className={`status-indicator ${isUrgent ? 'bg-red-500' : ''} mr-3`}></div>
                                <div>
                                    <p className="font-medium text-gray-800 dark:text-gray-200">{prospect.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{prospect.project || 'Pas de détails'}</p>
                                </div>
                            </div>
                            <div className={`text-sm ${isUrgent ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                                {dateText}
                            </div>
                        </div>
                    );
                })
            ) : (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                    Aucune relance prévue
                </div>
            )}
        </div>
    );
};

export default UpcomingFollowups;