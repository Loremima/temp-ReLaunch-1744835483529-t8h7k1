import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff, Rocket, ArrowRight } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    // Log registration attempt (without sensitive data)
    console.log('Attempting registration with email:', trimmedEmail);

    try {
      // Attempt to sign up
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: trimmedPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/app`
        }
      });

      // Log the response (excluding sensitive data)
      console.log('Registration response:', {
        success: !signUpError,
        error: signUpError ? {
          message: signUpError.message,
          status: signUpError.status
        } : null,
        user: data?.user ? {
          id: data.user.id,
          email: data.user.email,
          created_at: data.user.created_at
        } : null
      });

      if (signUpError) {
        throw signUpError;
      }

      if (data?.user) {
        navigate('/app');
      }
    } catch (error: any) {
      console.error('Registration error:', {
        message: error.message,
        status: error.status,
        statusText: error.statusText,
        details: error.details
      });

      // Set user-friendly error message
      setError(
        error.message === 'Database error saving new user'
          ? 'Impossible de créer le compte. Veuillez réessayer plus tard.'
          : error.message
      );
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
          Créez votre compte
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Commencez à automatiser vos relances dès aujourd'hui
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-xl sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Adresse email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
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
                <p className="mt-1 text-sm text-gray-500">
                  Le mot de passe doit contenir au moins 6 caractères
                </p>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300"
              >
                {isLoading ? 'Création en cours...' : 'Créer mon compte'}
                <ArrowRight className="ml-1.5 h-4 w-4 opacity-70 transform group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="mt-4">
              <p className="text-xs text-center text-gray-500">
                En créant un compte, vous acceptez nos{' '}
                <Link to="/terms" className="text-blue-600 hover:text-blue-500">
                  Conditions d'utilisation
                </Link>{' '}
                et notre{' '}
                <Link to="/privacy" className="text-blue-600 hover:text-blue-500">
                  Politique de confidentialité
                </Link>
              </p>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Vous avez déjà un compte?{' '}
                  <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                    Se connecter
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