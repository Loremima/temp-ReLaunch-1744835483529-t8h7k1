import React from 'react';
import { Mail } from 'lucide-react';

interface EmptyHistoryStateProps {
    message?: string;
    subMessage?: string;
}

/**
 * Affiche un état vide stylisé quand aucun historique d'email n'est disponible
 */
const EmptyHistoryState: React.FC<EmptyHistoryStateProps> = ({
    message = "Aucun historique d'email trouvé.",
    subMessage = "Envoyez des emails à vos prospects pour voir l'historique ici."
}) => {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="bg-gray-100 dark:bg-gray-800/40 p-4 rounded-full mb-4">
                <Mail className="h-12 w-12 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{message}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md">
                {subMessage}
            </p>
        </div>
    );
};

export default EmptyHistoryState; 