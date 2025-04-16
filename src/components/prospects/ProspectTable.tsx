import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
    Edit2,
    Trash2,
    ChevronUp,
    ChevronDown,
    ArrowUpDown
} from 'lucide-react';
import { Prospect } from '../../types';
import ProspectStatusBadge from './ProspectStatusBadge';

type SortableField = keyof Prospect | 'none';

interface ProspectTableProps {
    prospects: Prospect[];
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    sortField: SortableField;
    sortDirection: 'asc' | 'desc' | null;
    onSort: (field: SortableField) => void;
}

interface ColumnDefinition {
    key: SortableField;
    label: string;
}

/**
 * Tableau présentant la liste des prospects avec fonctionnalités de tri et actions
 */
const ProspectTable: React.FC<ProspectTableProps> = ({
    prospects,
    onEdit,
    onDelete,
    sortField,
    sortDirection,
    onSort
}) => {
    const columnDefinitions: ColumnDefinition[] = [
        { key: 'name', label: 'Prospect' },
        { key: 'company', label: 'Entreprise' },
        { key: 'first_contact', label: 'Premier contact' },
        { key: 'next_followup', label: 'Prochain suivi' },
        { key: 'status', label: 'Statut' },
        { key: 'none', label: 'Actions' }
    ];

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        return format(new Date(dateString), 'dd/MM/yyyy', { locale: fr });
    };

    return (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {columnDefinitions.map(({ key, label }) => (
                                <th
                                    key={key}
                                    onClick={() => key !== 'none' ? onSort(key) : null}
                                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${key !== 'none' ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                                >
                                    <div className="flex items-center space-x-1">
                                        <span>{label}</span>
                                        {key !== 'none' && (
                                            <>
                                                {sortField === key && sortDirection === 'asc' && (
                                                    <ChevronUp className="h-4 w-4 text-red-500" />
                                                )}
                                                {sortField === key && sortDirection === 'desc' && (
                                                    <ChevronDown className="h-4 w-4 text-red-500" />
                                                )}
                                                {(sortField !== key || !sortDirection) && (
                                                    <ArrowUpDown className="h-4 w-4 text-gray-400" />
                                                )}
                                            </>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {prospects.length > 0 ? (
                            prospects.map((prospect) => (
                                <tr
                                    key={prospect.id}
                                    className="hover:bg-gray-50 transition-colors"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <div className="text-sm font-medium text-gray-900">{prospect.name}</div>
                                            <div className="text-sm text-gray-500">{prospect.email}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {prospect.company || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(prospect.first_contact)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(prospect.next_followup)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <ProspectStatusBadge status={prospect.status} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center space-x-2 justify-end">
                                            <button
                                                onClick={() => onEdit(prospect.id)}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => onDelete(prospect.id)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                                    Aucun prospect trouvé
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProspectTable; 