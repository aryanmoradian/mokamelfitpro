import React, { useState, useEffect } from 'react';
import { XMarkIcon, InformationCircleIcon, SparklesIcon } from '@heroicons/react/24/solid';

const GUEST_WELCOME_DISMISSED_KEY = 'guestWelcomeDismissed';

const GuestWelcome: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem(GUEST_WELCOME_DISMISSED_KEY);
    if (!dismissed) {
      const renderTimer = setTimeout(() => setShouldRender(true), 1500);
      const visibleTimer = setTimeout(() => setIsVisible(true), 1600);

      return () => {
        clearTimeout(renderTimer);
        clearTimeout(visibleTimer);
      };
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem(GUEST_WELCOME_DISMISSED_KEY, 'true');
    setTimeout(() => setShouldRender(false), 500);
  };

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-5 right-5 w-full max-w-sm p-4 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50 transition-all duration-500 transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
      }`}
      style={{ animation: isVisible ? 'subtle-pulse 2.5s ease-in-out 2s' : 'none' }}
    >
      <button
        onClick={handleDismiss}
        className="absolute top-2 left-2 p-1 text-gray-500 rounded-full hover:bg-gray-700 hover:text-white transition-colors"
        aria-label="بستن پیام"
      >
        <XMarkIcon className="h-5 w-5" />
      </button>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-cyan-500/10 border border-cyan-500/30">
            <InformationCircleIcon className="h-6 w-6 text-cyan-400" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-white flex items-center gap-2">
            <SparklesIcon className="h-6 w-6 text-cyan-400" />
            <span>درود!</span>
          </h3>
          <p className="text-sm text-gray-300 mt-1">
            شما می‌توانید به عنوان مهمان از سیستم تحلیل استفاده کنید. اگر می‌خواهید تاریخچه تحلیل‌هایتان ذخیره شود و به امکانات بیشتر دسترسی داشته باشید، روی دکمه «ورود / ثبت نام» در منو کلیک کنید.
          </p>
           <p className="text-xs text-gray-400 mt-2">
            این پنجره را می‌توانید هر زمان که خواستید ببندید.
          </p>
        </div>
      </div>
      <div className="mt-4">
        <button
          onClick={handleDismiss}
          className="w-full bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-bold py-2 px-4 rounded-lg transition-colors"
        >
          فهمیدم!
        </button>
      </div>
    </div>
  );
};

export default GuestWelcome;
