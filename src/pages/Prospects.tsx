import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Download, AlertCircle, X } from 'lucide-react';
import { format } from 'date-fns';

// Composants
import ProspectTable from '../components/prospects/ProspectTable';
import ProspectFilters from '../components/prospects/ProspectFilters';
import AddProspectWizard from '../components/prospects/AddProspectWizard';
import CSVUploadModal from '../components/prospects/CSVUploadModal';

// Hooks
import { useProspects } from '../hooks';

export default function Prospects() {
  const navigate = useNavigate();
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const {
    loading,
    error,
    prospects,
    filteredProspects,
    filters,
    setFilters,
    sort,
    setSort,
    setEditingId,
    fetchProspects,
    deleteProspect
  } = useProspects();

  // Affiche l'erreur du hook ou l'erreur locale
  const displayError = localError || error;

  // Effacer l'erreur
  const clearError = () => {
    setLocalError(null);
  };

  // Gestion du tri
  const handleSort = (field: keyof typeof filteredProspects[0] | 'none') => {
    setSort(prev => ({
      field,
      direction: prev.field === field
        ? prev.direction === 'asc'
          ? 'desc'
          : prev.direction === 'desc'
            ? null
            : 'asc'
        : 'asc'
    }));
  };

  // Gestion de l'édition
  const handleEdit = (id: string) => {
    navigate(`/app/prospects/edit/${id}`);
  };

  // Gestion de la suppression
  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce prospect ?')) {
      const success = await deleteProspect(id);
      if (!success) {
        setLocalError("Erreur lors de la suppression du prospect");
      }
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Company', 'Project', 'Source', 'First Contact', 'Status', 'Next Follow-up', 'Stage'];
    const rows = filteredProspects.map(p => [
      p.name,
      p.email,
      p.company || '',
      p.project || '',
      p.source || '',
      p.first_contact,
      p.status,
      p.next_followup || '',
      p.followup_stage
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prospects_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Prospects</h1>

        <div className="flex items-center space-x-4">
          <button
            onClick={handleExportCSV}
            className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-300 shadow-sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Télécharger
          </button>
          <button
            onClick={() => setIsWizardOpen(true)}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all duration-300 shadow-sm hover:shadow transform hover:-translate-y-0.5"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un prospect
          </button>
        </div>
      </div>

      {displayError && (
        <div className="flex items-center bg-red-50 text-red-600 p-4 rounded-lg">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          <span className="text-sm">{displayError}</span>
          <button onClick={clearError} className="ml-auto">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Rechercher un prospect..."
            value={filters.searchTerm}
            onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
            className="px-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={filters.statusFilter}
          onChange={(e) => setFilters(prev => ({ ...prev, statusFilter: e.target.value }))}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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

      <ProspectTable
        prospects={filteredProspects}
        onEdit={handleEdit}
        onDelete={handleDelete}
        sortField={sort.field}
        sortDirection={sort.direction}
        onSort={handleSort}
      />

      <AddProspectWizard
        isOpen={isWizardOpen}
        onClose={() => {
          setIsWizardOpen(false);
          fetchProspects();
        }}
      />

      <CSVUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          fetchProspects();
        }}
      />
    </div>
  );
}