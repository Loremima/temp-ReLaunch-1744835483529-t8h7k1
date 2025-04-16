import React, { ReactNode } from 'react';

interface SettingsFormProps {
    title: string;
    description?: string;
    icon?: React.ElementType;
    children: ReactNode;
    actions?: ReactNode;
}

/**
 * Composant pour structurer les formulaires de paramètres
 */
const SettingsForm: React.FC<SettingsFormProps> = ({
    title,
    description,
    icon: Icon,
    children,
    actions
}) => {
    return (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    {Icon && <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
                    <div>
                        <h2 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h2>
                        {description && (
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {description}
                            </p>
                        )}
                    </div>
                </div>
                {actions && (
                    <div className="flex space-x-2">
                        {actions}
                    </div>
                )}
            </div>

            <div className="space-y-4">
                {children}
            </div>
        </div>
    );
};

export default SettingsForm; 