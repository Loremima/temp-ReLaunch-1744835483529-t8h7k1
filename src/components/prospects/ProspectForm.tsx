import React, { useState } from 'react';
import { format } from 'date-fns';
import { Prospect, ProspectStatus } from '../../types';

export interface ProspectFormData {
    name: string;
    email: string;
    company: string | null;
    project: string | null;
    first_contact: string;
    next_followup: string | null;
    status: ProspectStatus;
    followup_stage: number;
    notes: string | null;
    source: string | null;
}

interface ProspectFormProps {
    initialData?: Partial<ProspectFormData>;
    isNew?: boolean;
    onSave: (data: ProspectFormData) => void;
    onCancel: () => void;
    validateEmail?: (email: string) => boolean;
}

/**
 * Formulaire pour créer ou éditer un prospect
 */
const ProspectForm: React.FC<ProspectFormProps> = ({
    initialData,
    isNew = true,
    onSave,
    onCancel,
    validateEmail = (email: string) => {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
}) => {
    const today = new Date();
    const formattedToday = format(today, 'yyyy-MM-dd');

    const defaultData: ProspectFormData = {
        name: '',
        email: '',
        company: '',
        project: '',
        first_contact: formattedToday,
        next_followup: formattedToday,
        status: 'Pending',
        followup_stage: 1,
        notes: '',
        source: '',
    };

    const [formData, setFormData] = useState<ProspectFormData>({
        ...defaultData,
        ...initialData
    });

    const [errors, setErrors] = useState<Partial<Record<keyof ProspectFormData, string>>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when field is edited
        if (errors[name as keyof ProspectFormData]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        const newErrors: Partial<Record<keyof ProspectFormData, string>> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Le nom est requis';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'L\'email est requis';
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Format d\'email invalide';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onSave(formData);
    };

    return (
        <div className="bg-white dark:bg-gray-800/90 shadow-lg rounded-xl p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                {isNew ? 'Ajouter un prospect' : 'Modifier le prospect'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Nom <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name || ''}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-800/70 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white`}
                        />
                        {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email || ''}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-800/70 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white`}
                        />
                        {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Entreprise
                        </label>
                        <input
                            type="text"
                            name="project"
                            value={formData.project || ''}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800/70 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Premier contact
                        </label>
                        <input
                            type="date"
                            name="first_contact"
                            value={formData.first_contact || formattedToday}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800/70 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Prochaine relance
                        </label>
                        <input
                            type="date"
                            name="next_followup"
                            value={formData.next_followup || formattedToday}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800/70 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Statut
                        </label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800/70 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                        >
                            <option value="Pending">En attente</option>
                            <option value="Sent">Envoyé</option>
                            <option value="Opened">Ouvert</option>
                            <option value="Clicked">Cliqué</option>
                            <option value="Responded">Répondu</option>
                            <option value="Unsubscribed">Désabonné</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Étape de relance
                        </label>
                        <select
                            name="followup_stage"
                            value={formData.followup_stage}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800/70 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                        >
                            <option value={1}>Étape 1</option>
                            <option value={2}>Étape 2</option>
                            <option value={3}>Étape 3</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Source
                    </label>
                    <input
                        type="text"
                        name="source"
                        value={formData.source || ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800/70 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                        placeholder="LinkedIn, référence, etc."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Notes
                    </label>
                    <textarea
                        name="notes"
                        value={formData.notes || ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800/70 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                        rows={3}
                    />
                </div>

                <div className="flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 shadow-sm"
                    >
                        {isNew ? 'Ajouter' : 'Enregistrer les modifications'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProspectForm;
