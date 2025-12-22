
import React, { useState, useEffect } from 'react';
import { XMarkIcon, SparklesIcon, ShieldCheckIcon, BeakerIcon, UsersIcon } from '@heroicons/react/24/solid';

const WELCOME_MODAL_DISMISSED_KEY = 'fitProWelcomeDismissed';

const WelcomeModal: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        const dismissed = localStorage.getItem(WELCOME_MODAL_DISMISSED_KEY);
        if (!dismissed) {
            setShouldRender(true);
            const timer = setTimeout(() => setIsVisible(true), 100);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem(WELCOME_MODAL_DISMISSED_KEY, 'true');
        setTimeout(() => setShouldRender(false), 500);
    };

    if (!shouldRender) return null;

    return (
        <div 
            className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            onClick={handleDismiss}
        >
            <div 
                className={`relative w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl transition-all duration-500 transform ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-10'}`}
                onClick={e => e.stopPropagation()}
            >
                <button onClick={handleDismiss} className="absolute top-4 left-4 p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-full transition-colors">
                    <XMarkIcon className="h-6 w-6" />
                </button>

                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-3 bg-cyan-500/10 rounded-2xl mb-4 border border-cyan-500/20">
                        <SparklesIcon className="h-10 w-10 text-cyan-400" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">
                        به <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-500">فیت پرو</span> خوش آمدید؛
                    </h2>
                    <p className="text-lg text-cyan-300 font-medium mt-2 italic">جایی که بیولوژی شما، کد اختصاصی خود را پیدا می‌کند</p>
                </div>

                <div className="space-y-6 text-gray-300 text-right">
                    <p className="text-base leading-relaxed">
                        آیا می‌دانستید که استفاده از مکمل‌های ورزشی بدون شناخت دقیق از نیازهای بدن، نه تنها می‌تواند بی‌اثر باشد، بلکه گاهی به سلامتی شما آسیب می‌زند؟ در <strong>فیت پرو</strong>، دوران برنامه‌های عمومی به پایان رسیده است.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                        <div className="p-4 bg-gray-800/50 rounded-2xl border border-gray-700 text-center">
                            <BeakerIcon className="h-8 w-8 text-cyan-400 mx-auto mb-3" />
                            <h4 className="font-bold text-white text-sm mb-2">آنالیز هوشمند</h4>
                            <p className="text-xs text-gray-400">تحلیل دقیق خواب، استرس و اهداف بدنی توسط ساسکا.</p>
                        </div>
                        <div className="p-4 bg-gray-800/50 rounded-2xl border border-gray-700 text-center">
                            <SparklesIcon className="h-8 w-8 text-emerald-400 mx-auto mb-3" />
                            <h4 className="font-bold text-white text-sm mb-2">فرمولاسیون خاص</h4>
                            <p className="text-xs text-gray-400">تعیین دقیق نوع، دوز و زمان مصرف مکمل‌های شما.</p>
                        </div>
                        <div className="p-4 bg-gray-800/50 rounded-2xl border border-gray-700 text-center">
                            <ShieldCheckIcon className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                            <h4 className="font-bold text-white text-sm mb-2">تایید متخصصین</h4>
                            <p className="text-xs text-gray-400">بازبینی نهایی تمام برنامه‌ها توسط تیم متخصصین تغذیه.</p>
                        </div>
                    </div>

                    <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-2xl p-4 mt-6">
                        <div className="flex items-center gap-3 mb-2">
                            <UsersIcon className="h-5 w-5 text-cyan-400" />
                            <h4 className="font-bold text-cyan-300">چه فایده‌ای برای شما دارد؟</h4>
                        </div>
                        <ul className="text-sm space-y-2 list-disc list-inside">
                            <li>پایان حدس و گمان در خرید مکمل‌ها</li>
                            <li>صرفه‌جویی در هزینه با حذف مکمل‌های غیرضروری</li>
                            <li>نتایج سریع‌تر و پایدارتر در عضله‌سازی و چربی‌سوزی</li>
                        </ul>
                    </div>
                </div>

                <button 
                    onClick={handleDismiss}
                    className="w-full mt-8 bg-gradient-to-r from-cyan-500 to-emerald-600 hover:from-cyan-600 hover:to-emerald-700 text-white font-bold py-4 rounded-2xl transition-all shadow-xl hover:shadow-cyan-500/20 text-lg"
                >
                    همین حالا شروع کنید
                </button>
                <p className="text-center text-xs text-gray-500 mt-4">فیت پرو؛ شناسنامه جدید بدن شما</p>
            </div>
        </div>
    );
};

export default WelcomeModal;
