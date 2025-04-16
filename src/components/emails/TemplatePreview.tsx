import React from 'react';

interface TemplatePreviewProps {
    subject: string;
    body: string;
}

/**
 * Affiche une prévisualisation complète d'un template d'email, avec son sujet et son contenu
 */
const TemplatePreview: React.FC<TemplatePreviewProps> = ({ subject, body }) => {
    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject Line
                </label>
                <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                    {subject}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Body
                </label>
                <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg whitespace-pre-wrap">
                    {body}
                </div>
            </div>
        </div>
    );
};

export default TemplatePreview;
