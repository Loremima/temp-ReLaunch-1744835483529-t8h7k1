import React, { useState } from 'react';
import {
  ThemeSelector
} from '../../components/settings';
import { useSettings, useUser } from '../../hooks';
import { User, Pencil, Save, X, CheckCircle, AlertCircle } from 'lucide-react';

export default function GeneralSettings() {
  const { settings } = useSettings();
  const { profile, loading, error, updateUserProfile } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: ''
  });
  const [updateStatus, setUpdateStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string | null;
  }>({ type: null, message: null });

  // Initialiser le formulaire lorsque le profil est chargé
  React.useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || ''
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Si on annule l'édition, on réinitialise le formulaire
      setFormData({
        full_name: profile?.full_name || '',
        phone: profile?.phone || ''
      });
    }
    setIsEditing(!isEditing);
    setUpdateStatus({ type: null, message: null });
  };

  const handleSave = async () => {
    const result = await updateUserProfile({
      full_name: formData.full_name,
      phone: formData.phone
    });

    if (result.success) {
      setUpdateStatus({
        type: 'success',
        message: 'Informations personnelles mises à jour avec succès'
      });
      setIsEditing(false);

      // Masquer la notification après 3 secondes
      setTimeout(() => {
        setUpdateStatus({ type: null, message: null });
      }, 3000);
    } else {
      setUpdateStatus({
        type: 'error',
        message: result.error || 'Une erreur est survenue lors de la mise à jour'
      });
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Informations personnelles */}
      <div className="bg-white dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-blue-900/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/30">
              <User className="h-5 w-5 text-blue-600 dark:text-blue-300" />
            </div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Informations personnelles</h2>
          </div>

          {loading ? (
            <div className="flex items-center px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
              <div className="animate-spin h-4 w-4 border-2 border-gray-300 dark:border-gray-600 border-t-blue-600 dark:border-t-blue-400 rounded-full mr-2"></div>
              Chargement...
            </div>
          ) : (
            !isEditing ? (
              <button
                onClick={handleEditToggle}
                className="px-4 py-2 bg-white dark:bg-blue-900/20 border border-gray-300 dark:border-blue-700/50 rounded-xl hover:bg-gray-50 dark:hover:bg-blue-800/30 text-sm font-medium text-gray-700 dark:text-blue-200 transition-colors flex items-center"
              >
                <Pencil className="h-4 w-4 mr-2" />
                Modifier
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleEditToggle}
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors flex items-center"
                >
                  <X className="h-4 w-4 mr-1.5" />
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-medium transition-colors flex items-center disabled:opacity-70"
                  disabled={loading}
                >
                  <Save className="h-4 w-4 mr-1.5" />
                  {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </div>
            )
          )}
        </div>

        {/* Notification de mise à jour */}
        {updateStatus.type && (
          <div className={`mb-4 px-4 py-3 rounded-xl flex items-center ${updateStatus.type === 'success'
            ? 'bg-green-50 dark:bg-green-900/30 border border-green-100 dark:border-green-900/40 text-green-800 dark:text-green-300'
            : 'bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-900/40 text-red-800 dark:text-red-300'
            }`}>
            {updateStatus.type === 'success' ? (
              <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            )}
            <span className="text-sm">{updateStatus.message}</span>
          </div>
        )}

        {loading && !profile ? (
          <div className="space-y-4">
            <div className="h-12 bg-gray-200 dark:bg-gray-700/50 rounded-xl animate-pulse"></div>
            <div className="h-12 bg-gray-200 dark:bg-gray-700/50 rounded-xl animate-pulse"></div>
            <div className="h-12 bg-gray-200 dark:bg-gray-700/50 rounded-xl animate-pulse"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {!isEditing ? (
              <>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700/30">
                  <span className="text-gray-600 dark:text-gray-400">Nom</span>
                  <span className="text-gray-900 dark:text-white font-medium">{profile?.full_name || 'Non défini'}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700/30">
                  <span className="text-gray-600 dark:text-gray-400">Email</span>
                  <span className="text-gray-900 dark:text-white font-medium">{profile?.email || 'Non défini'}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700/30">
                  <span className="text-gray-600 dark:text-gray-400">Téléphone</span>
                  <span className="text-gray-900 dark:text-white font-medium">{profile?.phone || 'Non défini'}</span>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom</label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent"
                    placeholder="Votre nom complet"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={profile?.email || ''}
                    className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-500 dark:text-gray-400"
                    placeholder="Votre email"
                    disabled
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">L'email ne peut être modifié que via les paramètres de votre compte Supabase</p>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Téléphone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent"
                    placeholder="Votre numéro de téléphone"
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <ThemeSelector />
    </div>
  );
}