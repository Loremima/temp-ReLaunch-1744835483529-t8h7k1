import React, { ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger';

interface SettingsButtonProps {
    children: ReactNode;
    variant?: ButtonVariant;
    size?: 'sm' | 'md' | 'lg';
    icon?: React.ElementType;
    onClick?: () => void;
    disabled?: boolean;
    fullWidth?: boolean;
    type?: 'button' | 'submit' | 'reset';
}

/**
 * Bouton stylisé pour les sections de paramètres
 */
const SettingsButton: React.FC<SettingsButtonProps> = ({
    children,
    variant = 'secondary',
    size = 'md',
    icon: Icon,
    onClick,
    disabled = false,
    fullWidth = false,
    type = 'button'
}) => {
    // Classes de base
    const baseClasses = "flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50";

    // Classes pour les variants
    const variantClasses = {
        primary: "bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-800 focus:ring-blue-500",
        secondary: "bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 focus:ring-blue-500",
        tertiary: "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-gray-500",
        danger: "bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-800 focus:ring-red-500"
    };

    // Classes pour les tailles
    const sizeClasses = {
        sm: "text-xs px-2.5 py-1.5 rounded-md",
        md: "text-sm px-4 py-2 rounded-lg",
        lg: "text-base px-6 py-3 rounded-lg"
    };

    // Largeur
    const widthClasses = fullWidth ? "w-full" : "";

    return (
        <button
            type={type}
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClasses}`}
            onClick={onClick}
            disabled={disabled}
        >
            {Icon && <Icon className="h-5 w-5 mr-2" />}
            {children}
        </button>
    );
};

export default SettingsButton; 