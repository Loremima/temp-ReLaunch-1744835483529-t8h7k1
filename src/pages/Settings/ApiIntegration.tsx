import React from 'react';
import { Copy, Link, Lock, Unlock, RefreshCcw, ExternalLink } from 'lucide-react';

export default function ApiIntegration() {
    const apiKey = "sk_live_mYu2FhTygRjGcXhP9a1LoSwZ3"; // Clé factice pour la démo
    const [isKeyVisible, setIsKeyVisible] = React.useState(false);

    const toggleKeyVisibility = () => {
        setIsKeyVisible(!isKeyVisible);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // Idéalement, afficher une notification de succès ici
    };

    const regenerateKey = () => {
        // Cette fonction serait implémentée pour appeler l'API et régénérer la clé
        console.log("Regenerating API key...");
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-gray-900">Intégrations API</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Connectez ReLaunch à vos applications et services préférés
                </p>
            </div>

            {/* API Key Management */}
            <div className="bg-white shadow-lg rounded-xl border border-gray-100">
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Clé API</h2>
                    <p className="text-sm text-gray-500 mb-6">
                        Utilisez cette clé pour authentifier vos requêtes vers notre API. Ne la partagez jamais publiquement.
                    </p>

                    <div className="flex items-center space-x-3 mb-4">
                        <div className="relative flex-1">
                            <input
                                type={isKeyVisible ? "text" : "password"}
                                className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                                value={apiKey}
                                readOnly
                            />
                            <button
                                onClick={toggleKeyVisibility}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700"
                            >
                                {isKeyVisible ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                            </button>
                        </div>

                        <button
                            onClick={() => copyToClipboard(apiKey)}
                            className="p-2.5 text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-lg"
                            title="Copier"
                        >
                            <Copy className="h-4 w-4" />
                        </button>

                        <button
                            onClick={regenerateKey}
                            className="p-2.5 text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-lg"
                            title="Régénérer"
                        >
                            <RefreshCcw className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 text-yellow-800 text-sm flex items-start">
                        <Lock className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
                        <p>
                            La régénération de votre clé API invalidera votre clé actuelle. Tous les services utilisant cette clé devront être mis à jour.
                        </p>
                    </div>
                </div>
            </div>

            {/* Available Services */}
            <div className="bg-white shadow-lg rounded-xl border border-gray-100">
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Services Disponibles</h2>
                    <div className="space-y-4">
                        {[
                            {
                                name: "Zapier",
                                description: "Connectez ReLaunch à plus de 3000 applications",
                                connected: true,
                                icon: "https://cdn.zapier.com/zapier/images/logos/zapier-logo.svg"
                            },
                            {
                                name: "Slack",
                                description: "Recevez des notifications dans vos canaux",
                                connected: false,
                                icon: "https://a.slack-edge.com/80588/marketing/img/meta/slack_hash_128.png"
                            },
                            {
                                name: "HubSpot",
                                description: "Synchronisez vos prospects avec HubSpot CRM",
                                connected: false,
                                icon: "https://www.hubspot.com/hubfs/assets/hubspot.com/style-guide/brand-guidelines/guidelines_the-logo.svg"
                            },
                            {
                                name: "Google Calendar",
                                description: "Planifiez des tâches de suivi dans votre calendrier",
                                connected: false,
                                icon: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg"
                            }
                        ].map((service, index) => (
                            <div key={index} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                                <div className="flex items-center space-x-4">
                                    <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-lg flex items-center justify-center">
                                        <img src={service.icon} alt={service.name} className="max-h-6 max-w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">{service.name}</h3>
                                        <p className="text-sm text-gray-500">{service.description}</p>
                                    </div>
                                </div>
                                <button
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${service.connected
                                        ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        : "bg-blue-600 text-white hover:bg-blue-700"
                                        }`}
                                >
                                    {service.connected ? "Configurer" : "Connecter"}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Webhooks */}
            <div className="bg-white shadow-lg rounded-xl border border-gray-100">
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Webhooks</h2>
                    <p className="text-sm text-gray-500 mb-6">
                        Les webhooks permettent de recevoir des notifications en temps réel sur des événements spécifiques
                    </p>

                    <div className="mb-6">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                            Ajouter un webhook
                        </button>
                    </div>

                    <div className="rounded-lg border border-gray-200 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Événements</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex items-center">
                                            <span className="truncate max-w-xs">https://example.com/webhooks/relaunch</span>
                                            <button onClick={() => copyToClipboard("https://example.com/webhooks/relaunch")} className="ml-2 text-gray-400 hover:text-gray-600">
                                                <Copy className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-1">
                                            prospect.responded
                                        </span>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            email.sent
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button className="text-blue-600 hover:text-blue-900 mr-4">Modifier</button>
                                        <button className="text-red-600 hover:text-red-900">Supprimer</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Documentation */}
            <div className="bg-white shadow-lg rounded-xl border border-gray-100">
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Documentation</h2>
                    <p className="text-sm text-gray-500 mb-4">
                        Consultez notre documentation pour en savoir plus sur l'utilisation de notre API et des intégrations disponibles.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <a
                            href="#"
                            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <div className="mr-4 p-2 bg-blue-100 rounded-lg">
                                <Link className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900">Documentation API</h3>
                                <p className="text-sm text-gray-500">Guide complet de notre API REST</p>
                            </div>
                            <ExternalLink className="h-4 w-4 text-gray-400 ml-auto" />
                        </a>

                        <a
                            href="#"
                            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <div className="mr-4 p-2 bg-blue-100 rounded-lg">
                                <Link className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900">Guides d'intégration</h3>
                                <p className="text-sm text-gray-500">Tutoriels pas à pas pour les intégrations communes</p>
                            </div>
                            <ExternalLink className="h-4 w-4 text-gray-400 ml-auto" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
} 