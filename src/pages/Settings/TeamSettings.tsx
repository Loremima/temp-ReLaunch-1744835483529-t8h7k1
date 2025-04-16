import React from 'react';
import { Users, Shield, Mail, Plus, Trash2, Edit2, Check } from 'lucide-react';

export default function TeamSettings() {
  const teamMembers = [
    {
      id: 1,
      name: 'Jean Dupont',
      email: 'jean@example.com',
      role: 'Admin',
      avatar: 'JD',
      status: 'active'
    },
    {
      id: 2,
      name: 'Marie Martin',
      email: 'marie@example.com',
      role: 'Member',
      avatar: 'MM',
      status: 'active'
    }
  ];

  const roles = [
    {
      name: 'Admin',
      description: 'Accès complet à toutes les fonctionnalités',
      permissions: [
        'Gérer les membres de l\'équipe',
        'Configurer les paramètres',
        'Accéder à la facturation',
        'Gérer les intégrations'
      ]
    },
    {
      name: 'Member',
      description: 'Accès aux fonctionnalités de base',
      permissions: [
        'Gérer les prospects',
        'Envoyer des emails',
        'Voir les statistiques',
        'Créer des modèles'
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Team Members */}
      <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Users className="h-6 w-6 text-blue-600" />
            <h2 className="text-lg font-medium text-gray-900">Membres de l'équipe</h2>
          </div>
          <button className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 text-sm font-medium transition-colors">
            <Plus className="h-4 w-4 mr-2" />
            Inviter un membre
          </button>
        </div>

        <div className="space-y-4">
          {teamMembers.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium">
                  {member.avatar}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{member.name}</div>
                  <div className="text-sm text-gray-500">{member.email}</div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  member.role === 'Admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {member.role}
                </span>
                <div className="flex items-center space-x-2">
                  <button className="p-1 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Roles and Permissions */}
      <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
        <div className="flex items-center space-x-3 mb-6">
          <Shield className="h-6 w-6 text-blue-600" />
          <h2 className="text-lg font-medium text-gray-900">Rôles et permissions</h2>
        </div>

        <div className="space-y-6">
          {roles.map((role) => (
            <div key={role.name} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-medium text-gray-900">{role.name}</h3>
                  <p className="text-sm text-gray-500">{role.description}</p>
                </div>
                <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors">
                  Modifier
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {role.permissions.map((permission) => (
                  <div key={permission} className="flex items-center space-x-2 text-sm text-gray-600">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>{permission}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Invitations */}
      <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
        <div className="flex items-center space-x-3 mb-6">
          <Mail className="h-6 w-6 text-blue-600" />
          <h2 className="text-lg font-medium text-gray-900">Invitations en attente</h2>
        </div>

        <div className="text-center py-8 text-gray-500">
          <Mail className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <p>Aucune invitation en attente</p>
        </div>
      </div>
    </div>
  );
}