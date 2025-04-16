import React from 'react';
import { Rocket } from 'lucide-react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ className = '', size = 'md' }: LogoProps) {
  const sizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  return (
    <div className={`flex items-center ${className}`}>
      <div className="relative">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full p-1.5 flex items-center justify-center shadow-md">
          <Rocket className={`${size === 'sm' ? 'h-5 w-5' :
            size === 'md' ? 'h-6 w-6' :
              'h-8 w-8'
            } text-white`} />

          {/* Élément d'effet brillant */}
          <div className="absolute top-0 left-1/4 w-1/2 h-1/3 bg-white/20 rounded-full blur-[1px]"></div>
        </div>

        {/* Effet de halo lumineux en arrière-plan */}
        <div className="absolute -inset-1 bg-blue-500/20 rounded-full blur-md -z-10"></div>
      </div>

      {size !== 'sm' && (
        <div className="ml-2 relative">
          <span className={`font-bold bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent drop-shadow-sm ${sizes[size]}`}>
            ReLaunch
          </span>
          {/* Fin de trait élégante sous le texte */}
          <div className="absolute -bottom-1 left-0 w-2/3 h-0.5 bg-gradient-to-r from-blue-500/80 to-transparent rounded-full"></div>
        </div>
      )}
    </div>
  );
}