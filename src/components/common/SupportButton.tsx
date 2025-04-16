import React, { useState } from 'react';
import { MessageCircle, Book, Lightbulb } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Pas besoin de déclarations globales pour Crisp
// declare global { ... }

interface SupportButtonProps {
    className?: string;
}

export const SupportButton: React.FC<SupportButtonProps> = ({ className = '' }) => {
    // Plus besoin de isCrispReady
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    // Suppression du useEffect pour initialiser Crisp
    // useEffect(() => { ... }, []);

    const handleSupportClick = () => {
        // Remplacer par un lien mailto:
        window.location.href = "mailto:support@relaunch.com?subject=Demande de support";
        setIsMenuOpen(false);
    };

    const handleDocClick = () => {
        navigate('/settings/documentation');
        setIsMenuOpen(false);
    };

    const handleSuggestionClick = () => {
        // Remplacer par un lien mailto:
        window.location.href = "mailto:support@relaunch.com?subject=Suggestion d'amélioration";
        setIsMenuOpen(false);
    };

    return (
        <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
            <div className="relative">
                {isMenuOpen && (
                    <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-xl p-2 w-64 transform transition-all duration-200 ease-out">
                        <button
                            onClick={handleDocClick}
                            className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                        >
                            <Book className="w-5 h-5 mr-3" />
                            <span>Consulter la documentation</span>
                        </button>
                        <button
                            onClick={handleSupportClick}
                            className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                        >
                            <MessageCircle className="w-5 h-5 mr-3" />
                            <span>Contacter le support</span>
                        </button>
                        <button
                            onClick={handleSuggestionClick}
                            className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                        >
                            <Lightbulb className="w-5 h-5 mr-3" />
                            <span>Suggérer une amélioration</span>
                        </button>
                    </div>
                )}
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="group relative flex items-center justify-center w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300"
                    aria-label="Menu d'aide"
                >
                    <div className="absolute inset-0 bg-white rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    <MessageCircle className="w-6 h-6 transform group-hover:rotate-12 transition-transform duration-300" />
                    <span className="absolute right-0 bottom-full mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-lg">
                        Besoin d'aide ?
                    </span>
                </button>
            </div>
        </div>
    );
}; 