import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Mail, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { HistoryEntry } from '../../types';
import HistoryStatusBadge from './HistoryStatusBadge';

interface HistoryTableProps {
    history: HistoryEntry[];
}

/**
 * Tableau d'historique des emails envoyés
 */
const HistoryTable: React.FC<HistoryTableProps> = ({ history }) => {
    return (
        <div className="history-table">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="history-header">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Prospect
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Template
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Statut
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800/80 divide-y divide-gray-200 dark:divide-gray-700">
                    {history.length > 0 ? (
                        history.map((entry) => (
                            <tr key={entry.id} className="history-row">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                        {entry.prospect?.name}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {entry.prospect?.email}
                                    </div>
                                    {entry.prospect?.project && (
                                        <div className="text-xs text-gray-400 dark:text-gray-500">
                                            Entreprise: {entry.prospect.project}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 dark:text-white">
                                        {entry.template?.subject}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        Étape {entry.template?.stage}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {format(new Date(entry.sent_at), 'PPp', { locale: fr })}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <HistoryStatusBadge status={entry.status} />
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={4} className="px-6 py-8 text-center">
                                <div className="flex flex-col items-center">
                                    <Mail className="h-10 w-10 text-gray-400 dark:text-gray-600 mb-3" />
                                    <p className="text-gray-500 dark:text-gray-400 mb-2">
                                        Aucun historique d'email trouvé.
                                    </p>
                                    <p className="text-sm text-gray-400 dark:text-gray-500">
                                        Envoyez des emails à vos prospects pour voir l'historique ici.
                                    </p>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default HistoryTable; 