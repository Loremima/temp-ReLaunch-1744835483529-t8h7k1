import React from 'react';
import { Link } from 'react-router-dom';
import {
    User,
    Mail,
    Bell,
    Users,
    CreditCard,
    Database,
    Clock
} from 'lucide-react';

interface SettingsSection {
    id: string;
    label: string;
    icon: React.ElementType;
    path: string;
}

interface SettingsNavProps {
    activeSection: string;
}

/**
 * Navigation latérale pour les paramètres
 */
const SettingsNav: React.FC<SettingsNavProps> = ({ activeSection }) => {
    const sections: SettingsSection[] = [
        {
            id: 'general',
            label: 'Général',
            icon: User,
            path: '/app/settings/general'
        },
        {
            id: 'email',
            label: 'Email',
            icon: Mail,
            path: '/app/settings/email'
        },
        {
            id: 'automation',
            label: 'Automatisation',
            icon: Clock,
            path: '/app/settings/automation'
        },
        {
            id: 'notifications',
            label: 'Notifications',
            icon: Bell,
            path: '/app/settings/notifications'
        },
        {
            id: 'team',
            label: 'Équipe',
            icon: Users,
            path: '/app/settings/team'
        },
        {
            id: 'billing',
            label: 'Facturation',
            icon: CreditCard,
            path: '/app/settings/billing'
        },
        {
            id: 'custom-fields',
            label: 'Champs personnalisés',
            icon: Database,
            path: '/app/settings/custom-fields'
        }
    ];

    return (
        <nav className="space-y-1">
            {sections.map((section) => {
                const isActive = section.id === activeSection;
                return (
                    <Link
                        key={section.id}
                        to={section.path}
                        className={`flex items-center px-4 py-3 text-sm rounded-lg transition-colors ${isActive
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800/40'
                            }`}
                    >
                        <section.icon className={`h-5 w-5 mr-3 ${isActive ? 'text-blue-500 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
                            }`} />
                        {section.label}
                    </Link>
                );
            })}
        </nav>
    );
};

export default SettingsNav; 