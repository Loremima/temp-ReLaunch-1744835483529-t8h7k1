import React from 'react';
import { AlertTriangle, X, Loader } from 'lucide-react';

export interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isProcessing?: boolean;
}

/**
 * Modal de confirmation avec message d'avertissement
 */
const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirmer',
    cancelText = 'Annuler',
    isProcessing = false
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800/90 rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-fadeIn mx-4 border border-gray-100 dark:border-blue-900/20">
                <button
                    onClick={onClose}
                    disabled={isProcessing}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="flex items-center mb-6">
                    <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-full mr-4 shadow-sm">
                        <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">
                        {title}
                    </h3>
                </div>

                <div className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                    {message}
                </div>

                <div className="flex justify-end space-x-4">
                    <button
                        onClick={onClose}
                        disabled={isProcessing}
                        className="px-5 py-2.5 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isProcessing}
                        className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]"
                    >
                        {isProcessing ? (
                            <>
                                <Loader className="h-4 w-4 mr-2 animate-spin" />
                                <span>Traitement...</span>
                            </>
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal; 