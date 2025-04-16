import React from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface NotificationMessageProps {
    type: NotificationType;
    message: string;
    onClose?: () => void;
    autoClose?: boolean;
    autoCloseDelay?: number;
}

/**
 * Composant de notification pour afficher des messages à l'utilisateur
 */
export function NotificationMessage({
    type = 'info',
    message,
    onClose,
    autoClose = true,
    autoCloseDelay = 5000
}: NotificationMessageProps) {
    const [visible, setVisible] = React.useState(true);

    React.useEffect(() => {
        if (autoClose && visible) {
            const timer = setTimeout(() => {
                handleClose();
            }, autoCloseDelay);

            return () => clearTimeout(timer);
        }
    }, [autoClose, autoCloseDelay, visible]);

    const handleClose = () => {
        setVisible(false);
        if (onClose) {
            onClose();
        }
    };

    if (!visible) return null;

    // Déterminer l'icône et les couleurs en fonction du type
    const getTypeStyles = () => {
        switch (type) {
            case 'success':
                return {
                    icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                    bgColor: 'bg-green-50',
                    borderColor: 'border-green-300',
                    textColor: 'text-green-800'
                };
            case 'error':
                return {
                    icon: <AlertCircle className="h-5 w-5 text-red-500" />,
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-300',
                    textColor: 'text-red-800'
                };
            case 'warning':
                return {
                    icon: <AlertCircle className="h-5 w-5 text-yellow-500" />,
                    bgColor: 'bg-yellow-50',
                    borderColor: 'border-yellow-300',
                    textColor: 'text-yellow-800'
                };
            case 'info':
            default:
                return {
                    icon: <Info className="h-5 w-5 text-blue-500" />,
                    bgColor: 'bg-blue-50',
                    borderColor: 'border-blue-300',
                    textColor: 'text-blue-800'
                };
        }
    };

    const { icon, bgColor, borderColor, textColor } = getTypeStyles();

    return (
        <div className={`fixed bottom-4 right-4 z-50 flex items-center p-4 mb-4 border rounded-lg ${bgColor} ${borderColor} ${textColor}`} role="alert">
            <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 mr-2">
                {icon}
            </div>
            <div className="ms-3 text-sm font-normal">{message}</div>
            <button
                type="button"
                className={`ms-auto -mx-1.5 -my-1.5 ${bgColor} ${textColor} rounded-lg focus:ring-2 focus:ring-blue-400 p-1.5 inline-flex items-center justify-center h-8 w-8`}
                onClick={handleClose}
                aria-label="Fermer"
            >
                <X className="h-3 w-3" />
            </button>
        </div>
    );
} 