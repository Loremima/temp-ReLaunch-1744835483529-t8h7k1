import React from 'react';
import { Search } from 'lucide-react';
import { Prospect } from '../../hooks/useProspects';

interface ProspectFiltersProps {
    searchTerm: string;
    onSearchChange: (term: string) => void;
    statusFilter: string;
    onStatusFilterChange: (status: string) => void;
    sortField: keyof Prospect | 'none';
    sortDirection: 'asc' | 'desc' | null;
    onSortChange: (field: keyof Prospect | 'none') => void;
}

/**
 * Barre de filtrage et de recherche pour les prospects
 */
const ProspectFilters: React.FC<ProspectFiltersProps> = ({
    searchTerm,
    onSearchChange,
    statusFilter,
    onStatusFilterChange,
    sortField,
    sortDirection,
    onSortChange
}) => {
    return (
        <div className="bg-white dark:bg-gray-800/60 rounded-xl shadow-sm p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800/70 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
                        placeholder="Rechercher un prospect..."
                    />
                </div>
                <div className="flex items-center gap-3 sm:w-auto">
                    <select
                        value={statusFilter}
                        onChange={(e) => onStatusFilterChange(e.target.value)}
                        className="block py-2 px-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-800/70 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
                    >
                        <option value="">Tous les statuts</option>
                        <option value="Pending">En attente</option>
                        <option value="Sent">Envoyé</option>
                        <option value="Opened">Ouvert</option>
                        <option value="Clicked">Cliqué</option>
                        <option value="Responded">Répondu</option>
                        <option value="Unsubscribed">Désabonné</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default ProspectFilters; 