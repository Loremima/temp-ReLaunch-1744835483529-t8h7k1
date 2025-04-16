import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { SunMedium, Moon, Laptop } from 'lucide-react';
import SettingsForm from './SettingsForm';

interface ThemeSelectorProps {
    title?: string;
    description?: string;
}

/**
 * Composant pour sélectionner le thème de l'application
 */
const ThemeSelector: React.FC<ThemeSelectorProps> = ({
    title = 'Thème',
    description = 'Choisissez l\'apparence de l\'application'
}) => {
    const { theme, setTheme } = useTheme();

    // Fonction pour obtenir les classes CSS du bouton
    const getButtonClasses = (buttonTheme: 'light' | 'dark' | 'system') => {
        const baseClasses = "flex flex-col items-center justify-center py-6 rounded-lg border transition-colors";

        if (theme === buttonTheme) {
            return `${baseClasses} bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800`;
        }

        return `${baseClasses} bg-white border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700/80`;
    };

    // Fonction pour obtenir les classes CSS de l'icône
    const getIconClasses = (buttonTheme: 'light' | 'dark' | 'system') => {
        const baseClasses = "h-6 w-6 mb-2";

        if (theme === buttonTheme) {
            return `${baseClasses} text-blue-600 dark:text-blue-400`;
        }

        return `${baseClasses} text-gray-500 dark:text-gray-400`;
    };

    // Fonction pour obtenir les classes CSS du texte
    const getTextClasses = (buttonTheme: 'light' | 'dark' | 'system') => {
        const baseClasses = "text-sm font-medium";

        if (theme === buttonTheme) {
            return `${baseClasses} text-blue-600 dark:text-blue-400`;
        }

        return `${baseClasses} text-gray-700 dark:text-gray-300`;
    };

    return (
        <SettingsForm
            title={title}
            description={description}
        >
            <div className="grid grid-cols-3 gap-4">
                <button
                    onClick={() => setTheme('light')}
                    className={getButtonClasses('light')}
                >
                    <SunMedium className={getIconClasses('light')} />
                    <span className={getTextClasses('light')}>Clair</span>
                </button>

                <button
                    onClick={() => setTheme('dark')}
                    className={getButtonClasses('dark')}
                >
                    <Moon className={getIconClasses('dark')} />
                    <span className={getTextClasses('dark')}>Sombre</span>
                </button>

                <button
                    onClick={() => setTheme('system')}
                    className={getButtonClasses('system')}
                >
                    <Laptop className={getIconClasses('system')} />
                    <span className={getTextClasses('system')}>Système</span>
                </button>
            </div>
        </SettingsForm>
    );
};

export default ThemeSelector; 