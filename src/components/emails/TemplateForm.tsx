import React, { useState } from 'react';
import { Mail, FileText, X } from 'lucide-react';
import TemplateVariables from './TemplateVariables';

export interface TemplateFormData {
    name: string;
    stage: number;
    subject: string;
    body: string;
}

interface TemplateFormProps {
    initialData?: TemplateFormData;
    isNew?: boolean;
    onSave: (data: TemplateFormData) => void;
    onCancel: () => void;
}

/**
 * Formulaire de création ou d'édition d'un modèle d'email
 */
const TemplateForm: React.FC<TemplateFormProps> = ({
    initialData = { name: '', subject: '', body: '', stage: 1 },
    isNew = true,
    onSave,
    onCancel
}) => {
    const [formData, setFormData] = useState<TemplateFormData>(initialData);
    const [showVariables, setShowVariables] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'stage' ? parseInt(value) : value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className={isNew ? "template-editor p-6" : "space-y-6"}>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                    {isNew ? (
                        <Mail className="h-6 w-6 text-blue-500" />
                    ) : (
                        <FileText className="h-6 w-6 text-blue-500" />
                    )}
                    {isNew ? (
                        <h2 className="text-lg font-medium text-gray-900 dark:text-white">New Template</h2>
                    ) : (
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="text-lg font-medium px-2 py-1 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800/70 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                        />
                    )}
                </div>
                <button
                    onClick={onCancel}
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {isNew && (
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Template Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800/70 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                                placeholder="Stage 1 Template"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Follow-up Stage
                            </label>
                            <select
                                name="stage"
                                value={formData.stage}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800/70 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                            >
                                <option value={1}>Stage 1 (3 days)</option>
                                <option value={2}>Stage 2 (1 week)</option>
                                <option value={3}>Stage 3 (2 weeks)</option>
                            </select>
                        </div>
                    </div>
                )}

                {!isNew && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Follow-up Stage
                            </label>
                            <select
                                name="stage"
                                value={formData.stage}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800/70 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                            >
                                <option value={1}>Stage 1 (3 days)</option>
                                <option value={2}>Stage 2 (1 week)</option>
                                <option value={3}>Stage 3 (2 weeks)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Subject Line
                            </label>
                            <input
                                type="text"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800/70 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                            />
                        </div>
                    </div>
                )}

                {isNew && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Subject Line
                        </label>
                        <input
                            type="text"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800/70 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                            placeholder="Following up on {project}"
                        />
                    </div>
                )}

                <div>
                    <TemplateVariables
                        showVariables={showVariables}
                        onToggle={() => setShowVariables(!showVariables)}
                    />

                    <textarea
                        name="body"
                        value={formData.body}
                        onChange={handleChange}
                        className="email-content-editor w-full px-3 py-2 h-48 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                        placeholder={isNew ? "Hi {name},&#10;&#10;I hope this email finds you well.&#10;&#10;I'm following up on our discussion regarding {project}." : ""}
                    />
                </div>

                <div className="flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 shadow-sm"
                    >
                        {isNew ? "Save Template" : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TemplateForm;
