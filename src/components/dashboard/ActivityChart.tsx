import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export interface ChartData {
    date: string;
    emails: number;
    responses: number;
}

interface ActivityChartProps {
    data: ChartData[];
}

/**
 * Affiche un graphique d'activité des 7 derniers jours
 */
const ActivityChart: React.FC<ActivityChartProps> = ({ data }) => {
    const maxEmails = Math.max(...data.map(d => d.emails), 10);

    return (
        <div className="h-full flex flex-col justify-between">
            <div className="w-full h-52 flex items-end justify-between space-x-1 relative mb-2">
                {data.map((day, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center group relative">
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-8 bg-gray-900 dark:bg-gray-800 z-10 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                            {format(new Date(day.date), 'PPP', { locale: fr })}
                            <br />
                            Envoyés: {day.emails} | Réponses: {day.responses}
                        </div>
                        <div className="flex flex-col items-center space-y-1 w-full">
                            <div
                                className="w-full max-w-[35px] bg-blue-100 dark:bg-blue-900/30 rounded-t-md transition-all duration-300 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40"
                                style={{ height: `${Math.max((day.emails / maxEmails) * 100, 10)}%` }}
                            >
                                <div
                                    className="w-full bg-gradient-to-t from-blue-600 to-blue-500 dark:from-blue-500 dark:to-blue-400 rounded-t-md transition-all"
                                    style={{ height: `${(day.responses / day.emails) * 100 || 0}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700">
                {data.map((day, i) => (
                    <div key={i} className="text-center">
                        {format(new Date(day.date), 'E', { locale: fr })}
                    </div>
                ))}
            </div>

            <div className="flex justify-center mt-4 space-x-8">
                <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900/30 rounded mr-2"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Emails envoyés</span>
                </div>
                <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-600 dark:bg-blue-500 rounded mr-2"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Réponses reçues</span>
                </div>
            </div>
        </div>
    );
};

export default ActivityChart;