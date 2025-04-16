import React, { useState } from 'react';
import { Clock, Calendar, Globe, Check } from 'lucide-react';
import SettingsForm from './SettingsForm';
import SettingsButton from './SettingsButton';
import SettingsCard from './SettingsCard';

interface DateFormat {
    id: string;
    name: string;
    example: string;
}

interface TimeFormat {
    id: string;
    name: string;
    example: string;
}

interface Timezone {
    id: string;
    name: string;
    offset: string;
}

interface DateTimeSettingsProps {
    title?: string;
    description?: string;
    initialDateFormat?: string;
    initialTimeFormat?: string;
    initialTimezone?: string;
    onSave?: (settings: {
        dateFormat: string;
        timeFormat: string;
        timezone: string;
    }) => void;
}

const DateTimeSettings: React.FC<DateTimeSettingsProps> = ({
    title = 'Format de date et heure',
    description = 'Configurez l\'affichage des dates et heures',
    initialDateFormat = 'DD/MM/YYYY',
    initialTimeFormat = '24h',
    initialTimezone = 'Europe/Paris',
    onSave = () => { }
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [dateFormat, setDateFormat] = useState(initialDateFormat);
    const [timeFormat, setTimeFormat] = useState(initialTimeFormat);
    const [timezone, setTimezone] = useState(initialTimezone);

    // Options de format de date
    const dateFormats: DateFormat[] = [
        { id: 'DD/MM/YYYY', name: 'Jour/Mois/Année', example: '31/12/2023' },
        { id: 'MM/DD/YYYY', name: 'Mois/Jour/Année', example: '12/31/2023' },
        { id: 'YYYY-MM-DD', name: 'Année-Mois-Jour', example: '2023-12-31' },
        { id: 'DD MMM YYYY', name: 'Jour Mois Année', example: '31 déc. 2023' }
    ];

    // Options de format d'heure
    const timeFormats: TimeFormat[] = [
        { id: '24h', name: 'Format 24h', example: '14:30' },
        { id: '12h', name: 'Format 12h', example: '2:30 PM' }
    ];

    // Quelques fuseaux horaires communs
    const timezones: Timezone[] = [
        { id: 'Europe/Paris', name: 'Paris', offset: 'GMT+1' },
        { id: 'Europe/London', name: 'Londres', offset: 'GMT+0' },
        { id: 'America/New_York', name: 'New York', offset: 'GMT-5' },
        { id: 'America/Los_Angeles', name: 'Los Angeles', offset: 'GMT-8' },
        { id: 'Asia/Tokyo', name: 'Tokyo', offset: 'GMT+9' },
        { id: 'Australia/Sydney', name: 'Sydney', offset: 'GMT+11' }
    ];

    // Gestion de la sauvegarde
    const handleSave = () => {
        onSave({ dateFormat, timeFormat, timezone });
        setIsEditing(false);
    };

    // Format d'affichage
    const getDisplayFormat = (id: string, formats: Array<DateFormat | TimeFormat | Timezone>) => {
        const format = formats.find(f => f.id === id);
        return format ? format.name : id;
    };

    // Obtention du décalage horaire
    const getTimezoneOffset = (id: string) => {
        const tz = timezones.find(t => t.id === id);
        return tz ? tz.offset : '';
    };

    return (
        <SettingsForm
            title={title}
            description={description}
            icon={Clock}
            actions={
                !isEditing ? (
                    <SettingsButton
                        onClick={() => setIsEditing(true)}
                        variant="secondary"
                        size="sm"
                    >
                        Modifier
                    </SettingsButton>
                ) : (
                    <div className="flex space-x-2">
                        <SettingsButton
                            onClick={() => setIsEditing(false)}
                            variant="tertiary"
                            size="sm"
                        >
                            Annuler
                        </SettingsButton>
                        <SettingsButton
                            onClick={handleSave}
                            variant="primary"
                            size="sm"
                        >
                            Enregistrer
                        </SettingsButton>
                    </div>
                )
            }
        >
            {!isEditing ? (
                <div className="space-y-3">
                    <SettingsCard
                        icon={Calendar}
                        label="Format de date"
                        value={getDisplayFormat(dateFormat, dateFormats)}
                    />
                    <SettingsCard
                        icon={Clock}
                        label="Format d'heure"
                        value={getDisplayFormat(timeFormat, timeFormats)}
                    />
                    <SettingsCard
                        icon={Globe}
                        label="Fuseau horaire"
                        value={`${getDisplayFormat(timezone, timezones)} (${getTimezoneOffset(timezone)})`}
                    />
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Sélection du format de date */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Format de date</h3>
                        <div className="space-y-2">
                            {dateFormats.map(format => (
                                <button
                                    key={format.id}
                                    className={`flex items-center justify-between w-full p-3 rounded-lg transition-colors ${format.id === dateFormat
                                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-700/50 dark:text-gray-300 dark:hover:bg-gray-700'
                                        }`}
                                    onClick={() => setDateFormat(format.id)}
                                >
                                    <div className="flex flex-col items-start">
                                        <span className="font-medium">{format.name}</span>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Ex: {format.example}</span>
                                    </div>
                                    {format.id === dateFormat && (
                                        <Check className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sélection du format d'heure */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Format d'heure</h3>
                        <div className="space-y-2">
                            {timeFormats.map(format => (
                                <button
                                    key={format.id}
                                    className={`flex items-center justify-between w-full p-3 rounded-lg transition-colors ${format.id === timeFormat
                                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-700/50 dark:text-gray-300 dark:hover:bg-gray-700'
                                        }`}
                                    onClick={() => setTimeFormat(format.id)}
                                >
                                    <div className="flex flex-col items-start">
                                        <span className="font-medium">{format.name}</span>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Ex: {format.example}</span>
                                    </div>
                                    {format.id === timeFormat && (
                                        <Check className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sélection du fuseau horaire */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Fuseau horaire</h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                            {timezones.map(tz => (
                                <button
                                    key={tz.id}
                                    className={`flex items-center justify-between w-full p-3 rounded-lg transition-colors ${tz.id === timezone
                                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-700/50 dark:text-gray-300 dark:hover:bg-gray-700'
                                        }`}
                                    onClick={() => setTimezone(tz.id)}
                                >
                                    <div className="flex items-center">
                                        <span className="font-medium">{tz.name}</span>
                                        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">({tz.offset})</span>
                                    </div>
                                    {tz.id === timezone && (
                                        <Check className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </SettingsForm>
    );
};

export default DateTimeSettings; 