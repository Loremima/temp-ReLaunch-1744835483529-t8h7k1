import React from 'react';

export default function HelpSettings() {
    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 border border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Centre d'aide</h2>
                <div className="space-y-4">
                    <button className="w-full px-4 py-4 text-left bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <div className="font-medium text-gray-900 dark:text-white">Documentation</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Guides et tutoriels détaillés</div>
                    </button>
                    <button className="w-full px-4 py-4 text-left bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <div className="font-medium text-gray-900 dark:text-white">FAQ</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Questions fréquemment posées</div>
                    </button>
                    <button className="w-full px-4 py-4 text-left bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <div className="font-medium text-gray-900 dark:text-white">Support technique</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Contactez notre équipe</div>
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 border border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Ressources</h2>
                <div className="grid grid-cols-2 gap-4">
                    <a href="#" className="block p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <div className="font-medium text-gray-900 dark:text-white mb-1">Guide de démarrage</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Premiers pas avec ReLaunch</div>
                    </a>
                    <a href="#" className="block p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <div className="font-medium text-gray-900 dark:text-white mb-1">Meilleures pratiques</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Optimisez vos relances</div>
                    </a>
                    <a href="#" className="block p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <div className="font-medium text-gray-900 dark:text-white mb-1">Vidéos tutorielles</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Apprenez en vidéo</div>
                    </a>
                    <a href="#" className="block p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <div className="font-medium text-gray-900 dark:text-white mb-1">Blog</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Articles et actualités</div>
                    </a>
                </div>
            </div>
        </div>
    );
} 