import { useState, useEffect, useCallback } from 'react';

interface DateTimeSettings {
  dateFormat: string;
  timeFormat: string;
  timezone: string;
}

interface GeneralSettings {
  language: string;
  dateTime: DateTimeSettings;
}

interface Settings {
  general: GeneralSettings;
}

/**
 * Hook pour gérer les paramètres de l'application
 */
export function useSettings() {
  // Valeurs par défaut
  const defaultSettings: Settings = {
    general: {
      language: 'fr',
      dateTime: {
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        timezone: 'Europe/Paris'
      }
    }
  };

  // État des paramètres
  const [settings, setSettings] = useState<Settings>(() => {
    // Récupération des paramètres depuis localStorage si disponibles
    const savedSettings = localStorage.getItem('app_settings');
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  });

  // Mise à jour du localStorage lorsque les paramètres changent
  useEffect(() => {
    localStorage.setItem('app_settings', JSON.stringify(settings));
  }, [settings]);

  // Mise à jour de la langue
  const updateLanguage = useCallback((language: string) => {
    setSettings(prev => ({
      ...prev,
      general: {
        ...prev.general,
        language
      }
    }));
  }, []);

  // Mise à jour des paramètres de date et heure
  const updateDateTimeSettings = useCallback((dateTimeSettings: DateTimeSettings) => {
    setSettings(prev => ({
      ...prev,
      general: {
        ...prev.general,
        dateTime: dateTimeSettings
      }
    }));
  }, []);

  // Réinitialisation des paramètres
  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
  }, []);

  return {
    settings,
    updateLanguage,
    updateDateTimeSettings,
    resetSettings
  };
} 