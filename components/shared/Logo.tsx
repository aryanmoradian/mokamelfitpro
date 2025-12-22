
import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'gold' | 'white';
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', variant = 'default' }) => {
  const sizes = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-16'
  };

  const colors = {
    default: 'text-[#F5C542]',
    gold: 'text-[#F5C542]',
    white: 'text-white'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Symbol: Hexagon Strength Shield with F-Capsule */}
      <svg 
        viewBox="0 0 100 100" 
        className={`${sizes[size]} ${colors[variant]} fill-current transition-transform hover:scale-105 duration-300`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Hexagon Shield */}
        <path d="M50 5 L90 27.5 V72.5 L50 95 L10 72.5 V27.5 L50 5Z" fillOpacity="0.1" stroke="currentColor" strokeWidth="4" />
        {/* Inner Capsule / F Shape */}
        <rect x="35" y="30" width="15" height="40" rx="7.5" fill="currentColor" />
        <path d="M50 35 H65 C67.76 35 70 37.24 70 40 V40 C70 42.76 67.76 45 65 45 H50 V35Z" fill="currentColor" />
        <path d="M50 52 H60 C62.76 52 65 54.24 65 57 V57 C65 59.76 62.76 62 60 62 H50 V52Z" fill="currentColor" />
      </svg>
      
      {/* Wordmark */}
      <div className="flex flex-col leading-none select-none">
        <span className="font-brand font-black tracking-tighter text-white uppercase" style={{ fontSize: size === 'lg' ? '1.5rem' : '1.1rem' }}>
          MOKAMMEL
        </span>
        <div className="flex items-center gap-1">
          <span className="font-brand font-bold tracking-widest text-[#F5C542] text-[0.7rem] uppercase">
            FIT PRO
          </span>
          <div className="h-[2px] flex-1 bg-[#F5C542]/30"></div>
        </div>
      </div>
    </div>
  );
};

export default Logo;
