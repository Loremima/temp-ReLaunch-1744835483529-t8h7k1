import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
    icon: React.ElementType;
    title: string;
    value: string | number;
    color: 'blue' | 'green' | 'yellow' | 'indigo';
    trend?: { value: number; positive: boolean };
    description?: string;
}

/**
 * Affiche une carte de statistique avec une icône, un titre, une valeur et éventuellement une tendance
 */
const StatCard: React.FC<StatCardProps> = ({
    icon: Icon,
    title,
    value,
    color,
    trend,
    description
}) => {
    const gradients = {
        blue: 'from-blue-500 to-blue-600',
        green: 'from-green-500 to-green-600',
        yellow: 'from-amber-500 to-amber-600',
        indigo: 'from-indigo-500 to-indigo-600'
    };

    const darkGradients = {
        blue: 'dark:from-blue-400 dark:to-blue-600',
        green: 'dark:from-green-400 dark:to-green-600',
        yellow: 'dark:from-amber-400 dark:to-amber-600',
        indigo: 'dark:from-indigo-400 dark:to-indigo-600'
    };

    const iconBackground = {
        blue: 'bg-blue-100 dark:bg-blue-600/20',
        green: 'bg-green-100 dark:bg-green-600/20',
        yellow: 'bg-amber-100 dark:bg-amber-600/20',
        indigo: 'bg-indigo-100 dark:bg-indigo-600/20'
    };

    const iconColor = {
        blue: 'text-blue-600 dark:text-blue-300',
        green: 'text-green-600 dark:text-green-300',
        yellow: 'text-amber-600 dark:text-amber-300',
        indigo: 'text-indigo-600 dark:text-indigo-300'
    };

    const borderColor = {
        blue: 'border-blue-200/50 dark:border-blue-800/30',
        green: 'border-green-200/50 dark:border-green-800/30',
        yellow: 'border-amber-200/50 dark:border-amber-800/30',
        indigo: 'border-indigo-200/50 dark:border-indigo-800/30'
    };

    return (
        <div className={`bg-white dark:bg-gray-800/70 backdrop-blur-sm group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 rounded-2xl border ${borderColor[color]}`}>
            <div className="flex flex-col p-6">
                <div className="flex items-center mb-5">
                    <div className={`p-3 rounded-xl ${iconBackground[color]} backdrop-blur-sm shadow-sm`}>
                        <Icon className={`h-6 w-6 ${iconColor[color]}`} />
                    </div>
                    <h3 className="ml-3 text-sm font-medium text-gray-500 dark:text-blue-200">{title}</h3>
                </div>

                <div className="flex items-end justify-between">
                    <div className="flex flex-col">
                        <span className={`text-3xl font-bold bg-gradient-to-r ${gradients[color]} ${darkGradients[color]} bg-clip-text text-transparent drop-shadow-sm`}>
                            {value}
                        </span>
                        {trend && (
                            <div className="flex items-center mt-1.5 text-sm">
                                {trend.positive ? (
                                    <ArrowUpRight className="h-4 w-4 text-green-500 dark:text-green-300 mr-1.5" />
                                ) : (
                                    <ArrowDownRight className="h-4 w-4 text-red-500 dark:text-red-300 mr-1.5" />
                                )}
                                <span className={trend.positive ? 'text-green-600 dark:text-green-300 font-medium' : 'text-red-600 dark:text-red-300 font-medium'}>
                                    {trend.value}%
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {description && (
                    <p className="mt-2.5 text-sm text-gray-500 dark:text-blue-300/80">{description}</p>
                )}
            </div>
            <div className={`h-0.5 w-full bg-gradient-to-r ${gradients[color]} transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 rounded-b-2xl opacity-70`}></div>
        </div>
    );
};

export default StatCard;