
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-[#1A1A1A] border border-gray-800 rounded-2xl shadow-xl p-6 ${className}`}>
      {children}
    </div>
  );
};

export default Card;
