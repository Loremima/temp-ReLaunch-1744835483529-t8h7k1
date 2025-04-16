import React from 'react';
import { ProspectStatus } from '../../types';

interface ProspectStatusBadgeProps {
    status: ProspectStatus;
}

/**
 * Badge affichant le statut d'un prospect avec une couleur correspondante
 */
const ProspectStatusBadge: React.FC<ProspectStatusBadgeProps> = ({ status }) => {
    const statusStyles: Record<ProspectStatus, string> = {
        Pending: 'bg-yellow-100 text-yellow-800',
        Sent: 'bg-blue-100 text-blue-800',
        Opened: 'bg-cyan-100 text-cyan-800',
        Clicked: 'bg-purple-100 text-purple-800',
        Responded: 'bg-green-100 text-green-800',
        Unsubscribed: 'bg-gray-100 text-gray-800',
    };

    const statusLabels: Record<ProspectStatus, string> = {
        Pending: 'En attente',
        Sent: 'Envoyé',
        Opened: 'Ouvert',
        Clicked: 'Cliqué',
        Responded: 'Répondu',
        Unsubscribed: 'Désabonné',
    };

    // Gérer le cas où status est null ou undefined (même si le type ne le permet pas, par sécurité)
    const displayStatus = status || 'Pending';
    const styles = statusStyles[displayStatus] || statusStyles.Pending;
    const label = statusLabels[displayStatus] || statusLabels.Pending;

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles}`}>
            {label}
        </span>
    );
};

export default ProspectStatusBadge; 