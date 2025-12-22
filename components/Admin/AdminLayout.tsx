
import React from 'react';
import { ArrowRightOnRectangleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

interface AdminLayoutProps {
    onLogout: () => void;
    children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ onLogout, children }) => {
    return (
        <div className="min-h-screen bg-black text-gray-200">
            {/* Admin Header */}
            <header className="bg-[#1A1A1A] border-b border-[#F5C542]/20 sticky top-0 z-40 shadow-md">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 bg-[#F5C542] rounded-lg flex items-center justify-center shadow-lg shadow-[#F5C542]/20">
                            <ShieldCheckIcon className="h-6 w-6 text-black" />
                        </div>
                        <div>
                            <h1 className="font-brand font-black text-white text-lg tracking-tighter uppercase">FIT PRO <span className="text-[#F5C542]">ADMIN</span></h1>
                            <p className="text-[0.55rem] font-bold text-gray-500 uppercase tracking-widest -mt-1">مرکز کنترل سیستم</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col items-end">
                             <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                نشست فعال
                             </span>
                        </div>
                        <div className="h-8 w-px bg-gray-800 hidden md:block"></div>
                        <button 
                            onClick={onLogout} 
                            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all text-xs font-bold uppercase tracking-wider"
                        >
                            <ArrowRightOnRectangleIcon className="h-4 w-4" />
                            <span>خروج</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 animate-fade-in">
                {children}
            </main>
        </div>
    );
};

export default AdminLayout;
