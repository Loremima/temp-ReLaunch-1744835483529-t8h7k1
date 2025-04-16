import React from 'react';

interface EmailPreviewProps {
    content: string;
    className?: string;
}

/**
 * Affiche le contenu d'un email formaté pour la prévisualisation
 */
const EmailPreview: React.FC<EmailPreviewProps> = ({ content, className = '' }) => {
    return (
        <div className={`email-preview whitespace-pre-line text-gray-800 dark:text-gray-200 text-sm ${className}`}>
            {content}
        </div>
    );
};

export default EmailPreview;
