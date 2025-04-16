import React from 'react';
import { TrendingUp } from 'lucide-react';

interface ConversionRatesProps {
    openRate: number;
    clickRate: number;
    conversionRate: number;
}

/**
 * Affiche les statistiques de performance des emails (taux d'ouverture, de clic et de conversion)
 */
const ConversionRates: React.FC<ConversionRatesProps> = ({
    openRate,
    clickRate,
    conversionRate
}) => {
    return (
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 h-full w-full rounded-xl p-5 text-white">
            <div className="flex items-center justify-center mb-4">
                <TrendingUp className="h-5 w-5 mr-2" />
                <h2 className="text-xl font-semibold">Performance des relances</h2>
            </div>

            <div className="space-y-4 mt-6">
                <div className="bg-blue-900/40 border border-blue-800/60 rounded-xl p-4 flex flex-col items-center justify-center">
                    <p className="text-sm text-blue-200 mb-1">Taux d'ouverture</p>
                    <p className="text-4xl font-bold">{openRate}%</p>
                </div>

                <div className="bg-blue-900/40 border border-blue-800/60 rounded-xl p-4 flex flex-col items-center justify-center">
                    <p className="text-sm text-blue-200 mb-1">Taux de clic</p>
                    <p className="text-4xl font-bold">{clickRate}%</p>
                </div>

                <div className="bg-blue-900/40 border border-blue-800/60 rounded-xl p-4 flex flex-col items-center justify-center">
                    <p className="text-sm text-blue-200 mb-1">Taux de conversion</p>
                    <p className="text-4xl font-bold">{conversionRate}%</p>
                </div>
            </div>
        </div>
    );
};

export default ConversionRates; 