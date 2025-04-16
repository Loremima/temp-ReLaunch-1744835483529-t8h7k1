import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff, Rocket, ArrowRight, Check } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetPasswordMode, setResetPasswordMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [newPasswordMode, setNewPasswordMode] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);

  // Vérifie si l'URL contient le paramètre de réinitialisation
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const resetMode = queryParams.get('reset');

    // Si le paramètre reset est présent et que l'utilisateur a un token d'accès
    // (cas après avoir cliqué sur le lien de réinitialisation dans l'email)
    const checkResetSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (resetMode === 'true' && session) {
        setNewPasswordMode(true);
      }
    };

    checkResetSession();
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (signInError) {
        if (signInError.message === 'Invalid login credentials') {
          throw new Error('Email ou mot de passe invalide. Veuillez réessayer.');
        }
        throw signInError;
      }

      if (user) {
        navigate('/app');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/login?reset=true`,
      });

      if (error) {
        throw error;
      }

      setResetSent(true);
    } catch (error: any) {
      console.error('Reset password error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.updateUser({
        password: password.trim()
      });

      if (error) {
        throw error;
      }

      setPasswordChanged(true);
      // Réinitialiser le mot de passe dans le formulaire
      setPassword('');
    } catch (error: any) {
      console.error('Update password error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-blue-100/30 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex items-center justify-center">
          <Rocket className="h-10 w-10 text-blue-600" />
          <span className="ml-2 text-2xl font-bold text-gray-900">
            ReLaunch
          </span>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {newPasswordMode
            ? 'Créer un nouveau mot de passe'
            : (resetPasswordMode
              ? (resetSent ? 'Vérifiez votre email' : 'Réinitialiser votre mot de passe')
              : 'Connexion à votre compte')}
        </h2>
        {resetPasswordMode && !resetSent && (
          <p className="mt-2 text-center text-sm text-gray-600">
            Nous vous enverrons un lien pour créer un nouveau mot de passe
          </p>
        )}
        {resetSent && (
          <p className="mt-2 text-center text-sm text-gray-600">
            Un email de réinitialisation a été envoyé à <span className="font-medium">{email}</span>
          </p>
        )}
        {newPasswordMode && !passwordChanged && (
          <p className="mt-2 text-center text-sm text-gray-600">
            Veuillez créer un nouveau mot de passe pour votre compte
          </p>
        )}
        {newPasswordMode && passwordChanged && (
          <p className="mt-2 text-center text-sm text-gray-600">
            Votre mot de passe a été modifié avec succès
          </p>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-xl sm:px-10 border border-gray-100">
          {passwordChanged ? (
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center bg-green-100 rounded-full p-2 w-16 h-16 mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-gray-700 mb-6 text-center">
                Votre mot de passe a été changé avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
              </p>
              <button
                onClick={() => {
                  setNewPasswordMode(false);
                  setPasswordChanged(false);
                }}
                className="group inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
              >
                Se connecter
                <ArrowRight className="ml-1.5 h-4 w-4 opacity-70 transform group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ) : !resetSent ? (
            <form className="space-y-6" onSubmit={newPasswordMode ? handleUpdatePassword : (resetPasswordMode ? handleResetPassword : handleSubmit)}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {!newPasswordMode && (
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Adresse email
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              )}

              {(!resetPasswordMode || newPasswordMode) && (
                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      {newPasswordMode ? 'Nouveau mot de passe' : 'Mot de passe'}
                    </label>
                    {!newPasswordMode && !resetPasswordMode && (
                      <button
                        type="button"
                        onClick={() => setResetPasswordMode(true)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-500"
                      >
                        Mot de passe oublié?
                      </button>
                    )}
                  </div>
                  <div className="mt-1 relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete={newPasswordMode ? "new-password" : "current-password"}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-10 sm:text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    {newPasswordMode && (
                      <p className="mt-1 text-sm text-gray-500">
                        Le mot de passe doit contenir au moins 6 caractères
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300"
                >
                  {isLoading
                    ? (newPasswordMode
                      ? 'Mise à jour...'
                      : (resetPasswordMode ? 'Envoi en cours...' : 'Connexion en cours...'))
                    : (newPasswordMode
                      ? 'Définir le nouveau mot de passe'
                      : (resetPasswordMode ? 'Envoyer le lien de réinitialisation' : 'Se connecter'))}
                  <ArrowRight className="ml-1.5 h-4 w-4 opacity-70 transform group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center">
              <button
                onClick={() => {
                  setResetPasswordMode(false);
                  setResetSent(false);
                }}
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                Retour à la connexion
              </button>
            </div>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {newPasswordMode
                    ? 'Pas besoin de réinitialiser?'
                    : (resetPasswordMode ? 'Vous vous souvenez de votre mot de passe?' : 'Vous n\'avez pas de compte?')}{' '}
                  <Link
                    to={resetPasswordMode || newPasswordMode ? "/login" : "/register"}
                    onClick={() => {
                      if (resetPasswordMode) setResetPasswordMode(false);
                      if (newPasswordMode) setNewPasswordMode(false);
                    }}
                    className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    {resetPasswordMode || newPasswordMode ? 'Se connecter' : 'S\'inscrire'}
                  </Link>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}