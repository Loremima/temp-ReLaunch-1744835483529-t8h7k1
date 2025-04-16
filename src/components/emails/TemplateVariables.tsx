import React from 'react';
import { Info } from 'lucide-react';

interface TemplateVariablesProps {
    showVariables: boolean;
    onToggle: () => void;
}

/**
 * Composant pour afficher et gérer les variables de template disponibles
 */
const TemplateVariables: React.FC<TemplateVariablesProps> = ({
    showVariables,
    onToggle
}) => {
    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Body
                </label>
                <button
                    type="button"
                    onClick={onToggle}
                    className="text-xs flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                    <Info className="h-3 w-3 mr-1" />
                    {showVariables ? 'Hide Variables' : 'Show Variables'}
                </button>
            </div>

            {showVariables && (
                <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 text-xs rounded-md text-blue-800 dark:text-blue-300">
                    Available variables: <code>{'{name}'}</code>, <code>{'{project}'}</code>, <code>{'{company}'}</code>
                </div>
            )}
        </div>
    );
};

export default TemplateVariables;
