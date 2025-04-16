import React, { ReactNode } from 'react';

interface SettingsCardProps {
    label: string;
    value?: ReactNode;
    icon?: React.ElementType;
    onClick?: () => void;
}

/**
 * Carte d'information pour les sections de paramètres
 */
const SettingsCard: React.FC<SettingsCardProps> = ({
    label,
    value,
    icon: Icon,
    onClick
}) => {
    const isClickable = !!onClick;

    return (
        <div
            className={`flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg ${isClickable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors' : ''
                }`}
            onClick={onClick}
        >
            <div className="flex items-center space-x-3">
                {Icon && <Icon className="h-5 w-5 text-gray-400 dark:text-gray-500" />}
                <span className="text-gray-600 dark:text-gray-400">{label}</span>
            </div>
            {value && (
                <span className="text-gray-900 dark:text-gray-100 font-medium">
                    {value}
                </span>
            )}
        </div>
    );
};

export default SettingsCard; 