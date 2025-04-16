import React, { ReactNode } from 'react';
import { FileText, Send, Edit2, Trash2, Loader2, Check, AlertCircle } from 'lucide-react';
import TemplatePreview from './TemplatePreview';

interface Template {
    id: string;
    name: string;
    stage: number;
    subject: string;
    body: string;
}

interface TemplateCardProps {
    template: Template;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onSendTest: (template: Template) => void;
    onSendAll?: (template: Template) => void;
    isActive?: boolean;
    isSendingTest?: boolean;
    testStatus?: 'idle' | 'sending' | 'success' | 'error';
    children?: ReactNode;
}

/**
 * Carte affichant un modèle d'email avec des actions (éditer, supprimer, tester)
 */
const TemplateCard: React.FC<TemplateCardProps> = ({
    template,
    onEdit,
    onDelete,
    onSendTest,
    onSendAll,
    isActive = false,
    isSendingTest = false,
    testStatus = 'idle',
    children
}) => {
    const renderTestButton = () => {
        if (testStatus === 'sending') {
            return (
                <button
                    disabled
                    className="p-2 text-blue-400 rounded-lg bg-blue-50 transition-colors"
                    title="Sending test email..."
                >
                    <Loader2 className="h-4 w-4 animate-spin" />
                </button>
            );
        } else if (testStatus === 'success') {
            return (
                <button
                    disabled
                    className="p-2 text-green-600 rounded-lg bg-green-50 transition-colors"
                    title="Test email sent!"
                >
                    <Check className="h-4 w-4" />
                </button>
            );
        } else if (testStatus === 'error') {
            return (
                <button
                    onClick={() => onSendTest(template)}
                    className="p-2 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    title="Error sending test email. Try again?"
                >
                    <AlertCircle className="h-4 w-4" />
                </button>
            );
        }

        return (
            <button
                onClick={() => onSendTest(template)}
                className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                title="Send test email"
            >
                <Send className="h-4 w-4" />
            </button>
        );
    };

    return (
        <div className={`bg-white shadow-lg rounded-xl overflow-hidden border ${isActive ? 'border-blue-500' : 'border-gray-100'}`}>
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <FileText className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">{template.name}</h3>
                            <p className="text-sm text-gray-500">Stage {template.stage}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        {children || (
                            <>
                                {renderTestButton()}
                                <button
                                    onClick={() => onEdit(template.id)}
                                    className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                                    title="Edit template"
                                >
                                    <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => onDelete(template.id)}
                                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                    title="Delete template"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <TemplatePreview subject={template.subject} body={template.body} />
            </div>
        </div>
    );
};

export default TemplateCard;