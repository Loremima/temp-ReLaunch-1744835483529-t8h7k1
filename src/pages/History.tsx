import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';

// Composants
import HistoryTable from '../components/history/HistoryTable';
import EmptyHistoryState from '../components/history/EmptyHistoryState';

// Hooks
import { useHistory } from '../hooks';

export default function History() {
  const [localError, setLocalError] = useState<string | null>(null);
  const {
    loading,
    error,
    filteredHistory,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter
  } = useHistory();

  // Affiche l'erreur du hook ou l'erreur locale
  const displayError = localError || error;

  // Filtres de recherche de base
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Historique des relances</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Consultez l'historique de vos emails et suivez les interactions avec vos prospects
        </p>
      </div>

      {displayError && (
        <div className="flex items-center bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg border border-red-100 dark:border-red-800/30">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{displayError}</span>
        </div>
      )}

      {/* Filtres de recherche simples - possibilité d'extraire en composant séparé dans le futur */}
      <div className="flex items-center space-x-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Rechercher dans l'historique..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="block w-full pl-3 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => handleStatusFilterChange(e.target.value)}
          className="block py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="">Tous les statuts</option>
          <option value="Sent">Envoyé</option>
          <option value="Opened">Ouvert</option>
          <option value="Clicked">Cliqué</option>
          <option value="Responded">Répondu</option>
          <option value="Failed">Échec</option>
        </select>
      </div>

      {filteredHistory.length > 0 ? (
        <HistoryTable history={filteredHistory} />
      ) : (
        <EmptyHistoryState />
      )}
    </div>
  );
}