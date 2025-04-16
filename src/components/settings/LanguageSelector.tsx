import React, { useState } from 'react';
import { Globe, Languages, Check } from 'lucide-react';
import SettingsForm from './SettingsForm';
import SettingsButton from './SettingsButton';
import SettingsCard from './SettingsCard';

interface Language {
    code: string;
    name: string;
    localName: string;
}

interface LanguageSelectorProps {
    title?: string;
    description?: string;
    currentLanguage?: string;
    onLanguageChange?: (code: string) => void;
}

/**
 * Composant pour sélectionner la langue de l'application
 */
const LanguageSelector: React.FC<LanguageSelectorProps> = ({
    title = 'Langue',
    description = 'Choisissez la langue de l\'interface',
    currentLanguage = 'fr',
    onLanguageChange = () => { }
}) => {
    const [isSelecting, setIsSelecting] = useState(false);

    // Liste des langues disponibles
    const languages: Language[] = [
        { code: 'fr', name: 'French', localName: 'Français' },
        { code: 'en', name: 'English', localName: 'English' },
        { code: 'es', name: 'Spanish', localName: 'Español' },
        { code: 'de', name: 'German', localName: 'Deutsch' },
        { code: 'it', name: 'Italian', localName: 'Italiano' }
    ];

    // Récupération de la langue courante
    const getCurrentLanguage = () => {
        const lang = languages.find(l => l.code === currentLanguage);
        return lang ? lang.localName : 'Unknown';
    };

    // Changement de langue
    const handleLanguageChange = (code: string) => {
        onLanguageChange(code);
        setIsSelecting(false);
    };

    return (
        <SettingsForm
            title={title}
            description={description}
            icon={Globe}
            actions={
                !isSelecting ? (
                    <SettingsButton
                        onClick={() => setIsSelecting(true)}
                        variant="secondary"
                        size="sm"
                    >
                        Modifier
                    </SettingsButton>
                ) : (
                    <SettingsButton
                        onClick={() => setIsSelecting(false)}
                        variant="tertiary"
                        size="sm"
                    >
                        Annuler
                    </SettingsButton>
                )
            }
        >
            {!isSelecting ? (
                <SettingsCard
                    icon={Languages}
                    label="Langue sélectionnée"
                    value={getCurrentLanguage()}
                    onClick={() => setIsSelecting(true)}
                />
            ) : (
                <div className="space-y-2">
                    {languages.map(language => (
                        <button
                            key={language.code}
                            className={`flex items-center justify-between w-full p-4 rounded-lg transition-colors ${language.code === currentLanguage
                                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-700/50 dark:text-gray-300 dark:hover:bg-gray-700'
                                }`}
                            onClick={() => handleLanguageChange(language.code)}
                        >
                            <div className="flex items-center">
                                <span className="font-medium">{language.localName}</span>
                                <span className="ml-2 text-sm text-gray-500">({language.name})</span>
                            </div>
                            {language.code === currentLanguage && (
                                <Check className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </SettingsForm>
    );
};

export default LanguageSelector; 