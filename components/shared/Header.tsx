
import React, { useState, useRef, useEffect } from 'react';
import { 
  PhoneIcon, 
  ArrowRightOnRectangleIcon, 
  UserCircleIcon, 
  Cog6ToothIcon, 
  ChevronDownIcon,
  ShieldCheckIcon,
  StarIcon,
  Squares2X2Icon,
  GlobeAltIcon,
  BookOpenIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/solid';
import { User } from '../../types';
import Logo from './Logo';

const WhatsAppIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.267.651 4.383 1.905 6.344l-1.191 4.363 4.542-1.187z" /></svg>
);

const TelegramIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} viewBox="0 0 24 24" fill="currentColor"><path d="M24 0l-6 22-8.129-7.239 7.802-8.234-10.458 7.227-7.215-2.428 24-11.326z" /></svg>
);

interface HeaderProps {
    currentUser: User | null;
    onLogout: () => void;
    onNavigateToAuth: () => void;
    onOpenProfile: () => void;
    onNavigateToAdmin: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentUser, onLogout, onNavigateToAuth, onOpenProfile, onNavigateToAdmin }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isFamilyOpen, setIsFamilyOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const familyRef = useRef<HTMLDivElement>(null);

    const fitProSites = [
        { 
            name: 'فیت پرو', 
            url: 'https://fit-pro.ir', 
            desc: 'وب‌سایت اصلی و خدمات مربیگری', 
            icon: GlobeAltIcon, 
            color: 'text-cyan-400',
            bg: 'group-hover:bg-cyan-400/10'
        },
        { 
            name: 'مجله فیت پرو', 
            url: 'https://fitpromagazine.ir', 
            desc: 'مقالات علمی و آموزشی', 
            icon: BookOpenIcon, 
            color: 'text-emerald-400',
             bg: 'group-hover:bg-emerald-400/10'
        },
        { 
            name: 'مکمل پرو', 
            url: 'https://mokamelpro.ir', 
            desc: 'فروشگاه تخصصی مکمل', 
            icon: ShoppingBagIcon, 
            color: 'text-amber-400',
             bg: 'group-hover:bg-amber-400/10'
        }
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
            if (familyRef.current && !familyRef.current.contains(event.target as Node)) {
                setIsFamilyOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="bg-black/90 backdrop-blur-md sticky top-0 z-40 border-b border-[#F5C542]/10 shadow-lg">
            <div className="container mx-auto flex justify-between items-center p-3">
                <div className="flex items-center gap-4">
                    <div className="cursor-pointer" onClick={() => window.location.reload()}>
                        <Logo size="md" />
                    </div>

                    {/* Fit Pro Family Widget */}
                    <div className="relative hidden md:block" ref={familyRef}>
                        <button 
                            onClick={() => setIsFamilyOpen(!isFamilyOpen)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 ${isFamilyOpen ? 'bg-[#F5C542]/10 text-[#F5C542]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <Squares2X2Icon className="h-6 w-6" />
                            <span className="text-xs font-bold uppercase tracking-wider">اکوسیستم فیت پرو</span>
                            <ChevronDownIcon className={`h-3 w-3 transition-transform ${isFamilyOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isFamilyOpen && (
                            <div className="absolute top-full right-0 mt-3 w-72 bg-[#1A1A1A] border border-[#F5C542]/20 rounded-2xl shadow-2xl p-2 animate-fade-in z-50 overflow-hidden backdrop-blur-xl">
                                <div className="px-4 py-2 border-b border-gray-800 mb-2">
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">خانواده بزرگ فیت پرو</span>
                                </div>
                                <div className="space-y-1">
                                    {fitProSites.map((site) => (
                                        <a 
                                            key={site.name}
                                            href={site.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`flex items-start gap-3 p-3 rounded-xl transition-all group ${site.bg} hover:bg-white/5`}
                                        >
                                            <div className={`p-2 rounded-lg bg-black/40 border border-gray-800 ${site.color}`}>
                                                <site.icon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">{site.name}</h4>
                                                <p className="text-[10px] text-gray-500 mt-0.5">{site.desc}</p>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                                <div className="mt-2 pt-2 border-t border-gray-800 text-center">
                                    <span className="text-[9px] text-gray-600 font-brand">قدرت گرفته از گروه فیت پرو</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                
                <nav className="flex items-center gap-2 md:gap-4">
                     {/* Mobile Family Icon (Visible only on small screens) */}
                     <div className="relative md:hidden" ref={familyRef}>
                        <button 
                            onClick={() => setIsFamilyOpen(!isFamilyOpen)}
                            className={`p-2 rounded-lg transition-colors ${isFamilyOpen ? 'text-[#F5C542] bg-[#F5C542]/10' : 'text-gray-400'}`}
                        >
                            <Squares2X2Icon className="h-6 w-6" />
                        </button>
                        {isFamilyOpen && (
                            <div className="absolute top-full left-0 mt-2 w-64 bg-[#1A1A1A] border border-[#F5C542]/20 rounded-xl shadow-2xl p-2 animate-fade-in z-50">
                                {fitProSites.map((site) => (
                                    <a key={site.name} href={site.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 mb-1">
                                        <site.icon className={`h-5 w-5 ${site.color}`} />
                                        <span className="text-sm font-bold text-gray-300">{site.name}</span>
                                    </a>
                                ))}
                            </div>
                        )}
                     </div>

                     {currentUser ? (
                        <div className="relative" ref={dropdownRef}>
                            <button 
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-[#1A1A1A] transition-all border border-transparent hover:border-[#F5C542]/20"
                            >
                                <div className="h-8 w-8 rounded-full bg-[#F5C542]/10 border border-[#F5C542]/30 flex items-center justify-center text-[#F5C542] font-black font-brand">
                                    {currentUser.firstName?.[0] || currentUser.email[0].toUpperCase()}
                                </div>
                                <span className="text-sm font-bold text-gray-300 hidden md:block max-w-[120px] truncate">
                                    {currentUser.displayName || currentUser.email.split('@')[0]}
                                </span>
                                <ChevronDownIcon className={`h-4 w-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute left-0 mt-2 w-64 bg-[#1A1A1A] border border-[#F5C542]/20 rounded-xl shadow-2xl py-2 animate-fade-in origin-top-left overflow-hidden">
                                    <div className="px-4 py-3 border-b border-[#F5C542]/10 bg-black/30">
                                        <div className="flex items-center gap-1">
                                            <p className="text-sm font-bold text-white truncate">{currentUser.displayName}</p>
                                            {currentUser.emailVerified && <ShieldCheckIcon className="h-4 w-4 text-emerald-500" />}
                                        </div>
                                        <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                                    </div>

                                    {currentUser.role === 'admin' && (
                                        <button onClick={() => { onNavigateToAdmin(); setIsDropdownOpen(false); }} className="w-full text-right px-4 py-3 text-sm text-[#F5C542] hover:bg-white/5 flex items-center gap-3 font-black group">
                                            <ShieldCheckIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                            پنل مدیریت سیستم
                                        </button>
                                    )}
                                    
                                    <button className="w-full text-right px-4 py-3 text-sm text-[#F5C542] hover:bg-[#F5C542]/10 flex items-center gap-3 font-black group elite-shimmer border-y border-[#F5C542]/10">
                                        <StarIcon className="h-5 w-5 fill-current" />
                                        اشتراک ویژه ELITE
                                    </button>

                                    <button onClick={() => { onOpenProfile(); setIsDropdownOpen(false); }} className="w-full text-right px-4 py-3 text-sm text-gray-300 hover:bg-white/5 flex items-center gap-3">
                                        <Cog6ToothIcon className="h-5 w-5" />
                                        تنظیمات پروفایل
                                    </button>
                                    
                                    <div className="h-px bg-[#F5C542]/10 mx-4 my-1"></div>
                                    
                                    <button onClick={() => { onLogout(); setIsDropdownOpen(false); }} className="w-full text-right px-4 py-3 text-sm text-red-500 hover:bg-red-500/5 flex items-center gap-3 font-bold">
                                        <ArrowRightOnRectangleIcon className="h-5 w-5" />
                                        خروج از حساب
                                    </button>
                                </div>
                            )}
                        </div>
                     ) : (
                        <>
                            <button onClick={onNavigateToAuth} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-[#F5C542] bg-[#1A1A1A] border border-[#F5C542]/30 rounded-lg hover:bg-[#F5C542] hover:text-black transition-all duration-300">
                                <UserCircleIcon className="h-5 w-5" />
                                <span className="hidden sm:inline">ورود / ثبت نام</span>
                                <span className="sm:hidden">ورود</span>
                            </button>
                            <div className="flex items-center gap-3">
                                <a href="https://wa.me/9981749697" target="_blank" rel="noopener noreferrer" className="group" aria-label="WhatsApp">
                                   <div className="bg-[#1A1A1A] border border-gray-800 group-hover:bg-[#25D366] group-hover:border-[#25D366] rounded-full p-2 transition-all duration-300 transform group-hover:scale-110">
                                        <WhatsAppIcon className="h-5 w-5 text-gray-500 group-hover:text-white" />
                                   </div>
                                </a>
                                <a href="http://t.me/mokamelfitpro_support" target="_blank" rel="noopener noreferrer" className="group" aria-label="Telegram">
                                   <div className="bg-[#1A1A1A] border border-gray-800 group-hover:bg-[#0088cc] group-hover:border-[#0088cc] rounded-full p-2 transition-all duration-300 transform group-hover:scale-110">
                                        <TelegramIcon className="h-5 w-5 text-gray-500 group-hover:text-white" />
                                   </div>
                                </a>
                            </div>
                        </>
                     )}
                </nav>
            </div>
        </header>
    );
};

export default Header;
