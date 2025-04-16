import React from 'react';
import LogoImg from '@/assets/logo-white.png';
import { useTheme } from '@/hooks/useTheme';

interface LogoProps {
    collapsed?: boolean;
}

const Logo: React.FC<LogoProps> = ({ collapsed = false }) => {
    const { isDarkMode } = useTheme();

    return (
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'px-6'} py-6`}>
            <div className="relative">
                <img
                    src={LogoImg}
                    alt="Logo"
                    className={`${collapsed ? 'w-10' : 'w-32'} h-auto drop-shadow-md filter brightness-125 transition-all duration-200`}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-transparent rounded-full blur-lg -z-10"></div>
            </div>
            {!collapsed && (
                <div className="ml-2 text-xl font-bold text-white drop-shadow-sm">
                    EmailFlow
                </div>
            )}
        </div>
    );
};

export default Logo; 