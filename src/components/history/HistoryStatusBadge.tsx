import React from 'react';
import { Mail, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

type HistoryStatus = 'Sent' | 'Opened' | 'Clicked' | 'Responded' | 'Failed';

interface HistoryStatusBadgeProps {
    status: HistoryStatus;
}

/**
 * Badge affichant le statut d'un email avec une couleur et une icône appropriées
 */
const HistoryStatusBadge: React.FC<HistoryStatusBadgeProps> = ({ status }) => {
    const getStatusIcon = (status: HistoryStatus) => {
        switch (status) {
            case 'Sent':
                return <Mail className="h-4 w-4 text-blue-500 dark:text-blue-400" />;
            case 'Opened':
                return <Clock className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />;
            case 'Clicked':
                return <CheckCircle className="h-4 w-4 text-purple-500 dark:text-purple-400" />;
            case 'Responded':
                return <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />;
            case 'Failed':
                return <XCircle className="h-4 w-4 text-red-500 dark:text-red-400" />;
            default:
                return <AlertCircle className="h-4 w-4 text-gray-500 dark:text-gray-400" />;
        }
    };

    const getStatusColor = (status: HistoryStatus) => {
        switch (status) {
            case 'Sent':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            case 'Opened':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'Clicked':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
            case 'Responded':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'Failed':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-400';
        }
    };

    const getStatusLabel = (status: HistoryStatus) => {
        switch (status) {
            case 'Sent':
                return 'Envoyé';
            case 'Opened':
                return 'Ouvert';
            case 'Clicked':
                return 'Cliqué';
            case 'Responded':
                return 'Répondu';
            case 'Failed':
                return 'Échec';
            default:
                return status;
        }
    };

    return (
        <div className="flex items-center">
            {getStatusIcon(status)}
            <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(status)}`}>
                {getStatusLabel(status)}
            </span>
        </div>
    );
};

export default HistoryStatusBadge; 