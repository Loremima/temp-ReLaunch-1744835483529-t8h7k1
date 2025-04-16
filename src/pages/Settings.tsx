import React from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Shield,
  User,
  HelpCircle,
  LinkIcon,
  Users,
  ChevronLeft,
  Clock
} from 'lucide-react';

import AccountSettings from './Settings/AccountSettings';
import TeamSettings from './Settings/TeamSettings';
import ApiIntegration from './Settings/ApiIntegration';
import GeneralSettings from './Settings/GeneralSettings';
import HelpSettings from './Settings/HelpSettings';
import AutomationSettings from './Settings/AutomationSettings';

const settingsSections = [
  {
    id: 'general',
    name: 'Compte',
    icon: User,
    href: '/app/settings',
    description: 'Thème et préférences générales'
  },
  {
    id: 'account',
    name: 'Facturation',
    icon: Shield,
    href: '/app/settings/account',
    description: 'Gérez votre profil, abonnements et moyens de paiement'
  },
  {
    id: 'team',
    name: 'Équipe',
    icon: Users,
    href: '/app/settings/team',
    description: 'Gérez les membres de votre équipe et leurs permissions'
  },
  {
    id: 'automation',
    name: 'Automatisation',
    icon: Clock,
    href: '/app/settings/automation',
    description: 'Configurez l\'envoi automatique d\'emails'
  },
  {
    id: 'integrations',
    name: 'Intégrations',
    icon: LinkIcon,
    href: '/app/settings/integrations',
    description: 'API, webhooks et services connectés'
  },
  {
    id: 'help',
    name: 'Aide & Support',
    icon: HelpCircle,
    href: '/app/settings/help',
    description: 'Documentation et ressources d\'aide'
  }
];

export default function Settings() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div>
      {/* Header with back button */}
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={() => navigate('/app/dashboard')}
          className="p-2 text-gray-600 hover:text-gray-900 dark:text-blue-300 dark:hover:text-blue-100 hover:bg-gray-100 dark:hover:bg-blue-800/30 rounded-lg transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Paramètres</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-blue-200">
            Gérez vos préférences et configurez votre compte
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-8">
        {/* Settings Navigation */}
        <div className="col-span-1">
          <nav className="space-y-2">
            {settingsSections.map((section) => {
              const Icon = section.icon;
              const isActive = location.pathname === section.href ||
                (section.href !== '/app/settings' && location.pathname.startsWith(section.href));

              return (
                <Link
                  key={section.id}
                  to={section.href}
                  className={`flex items-center px-4 py-3 rounded-xl transition-all duration-300 group ${isActive
                    ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-md dark:from-blue-500 dark:to-blue-700'
                    : 'hover:bg-blue-50/50 dark:hover:bg-blue-800/20'
                    }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-blue-600 dark:text-blue-300 group-hover:text-blue-700 dark:group-hover:text-blue-200'}`} />
                  <div className="ml-3 flex-1">
                    <p className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-900 dark:text-blue-100'}`}>
                      {section.name}
                    </p>
                    <p className={`text-xs ${isActive ? 'text-blue-100' : 'text-gray-500 dark:text-blue-300'}`}>
                      {section.description}
                    </p>
                  </div>
                  <ChevronLeft className={`h-4 w-4 ${isActive ? 'text-white' : 'text-gray-400 dark:text-blue-300'
                    } opacity-0 group-hover:opacity-100 transition-opacity transform rotate-180`} />
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="col-span-3">
          <Routes>
            <Route path="/" element={<GeneralSettings />} />
            <Route path="/account" element={<AccountSettings />} />
            <Route path="/team" element={<TeamSettings />} />
            <Route path="/automation" element={<AutomationSettings />} />
            <Route path="/integrations" element={<ApiIntegration />} />
            <Route path="/help" element={<HelpSettings />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}