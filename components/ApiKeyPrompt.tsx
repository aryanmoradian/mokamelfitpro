import React, { useState } from 'react';
import Card from './shared/Card';
import LoadingSpinner from './shared/LoadingSpinner';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';

interface ApiKeyPromptProps {
  onSubmit: (apiKey: string) => void;
}

const ApiKeyPrompt: React.FC<ApiKeyPromptProps> = ({ onSubmit }) => {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setError('کلید API نمی‌تواند خالی باشد.');
      return;
    }
    setError('');
    setIsLoading(true);
    // Simulate a quick check, then submit
    setTimeout(() => {
      onSubmit(apiKey.trim());
      // No need to setIsLoading(false) as the component will unmount
    }, 500);
  };

  return (
    <div className="max-w-xl mx-auto animate-fade-in mt-16">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-500 animate-gradient-text">
          تنظیمات اولیه: اتصال به هوش مصنوعی
        </h1>
        <p className="mt-4 text-lg text-gray-300">برای فعال‌سازی «ساسکا»، به کلید API گوگل نیاز دارید.</p>
      </div>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-200">کلید API چیست؟</h2>
            <p className="text-sm text-gray-400 mt-2">
              این کلید مانند یک رمز عبور امن برای استفاده از خدمات هوش مصنوعی گوگل (Gemini) است. برنامه ما از این کلید برای ارتباط با ساسکا استفاده می‌کند.
            </p>
            <div className="mt-4 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                <h3 className="font-semibold text-cyan-400">چگونه کلید API رایگان دریافت کنم؟</h3>
                <ol className="list-decimal list-inside text-sm text-gray-300 mt-2 space-y-1">
                    <li>به وب‌سایت Google AI Studio بروید.</li>
                    <li>با حساب گوگل خود وارد شوید.</li>
                    <li>روی دکمه "Create API key" کلیک کنید.</li>
                    <li>کلید ساخته شده را کپی کرده و در کادر زیر قرار دهید.</li>
                </ol>
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="inline-block mt-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">
                    دریافت کلید از Google AI Studio
                </a>
            </div>
          </div>
          
          <div className="mt-2 p-4 bg-amber-900/50 rounded-lg border border-amber-500/50">
              <h3 className="font-bold text-amber-300 flex items-center gap-2">
                  <ExclamationTriangleIcon className="h-5 w-5"/>
                  هشدار مهم برای سایت‌های آنلاین
              </h3>
              <p className="text-sm text-amber-200 mt-2">
                  اگر این برنامه را روی هاست یا دامنه شخصی خود (مانند <code className="bg-gray-700 text-xs p-1 rounded-md">mokamelfitpro.ir</code>) اجرا می‌کنید، پس از ساخت کلید API، **باید** دامنه سایت خود را در تنظیمات امنیتی آن ثبت کنید. در غیر این صورت با خطای اتصال (CORS) مواجه خواهید شد.
              </p>
              <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="inline-block mt-3 text-sm font-semibold text-white hover:underline">
                  رفتن به تنظیمات کلید در Google Cloud &rarr;
              </a>
          </div>

          <div>
            <label htmlFor="api-key" className="block text-sm font-medium text-gray-300 mb-2">
              کلید API گوگل شما
            </label>
            <input
              type="password"
              id="api-key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow"
              placeholder="کلید خود را اینجا وارد کنید..."
              required
              disabled={isLoading}
            />
          </div>

          {error && <p className="text-red-400 text-center text-sm">{error}</p>}
          
          <div>
            <button
              type="submit"
              disabled={isLoading || !apiKey.trim()}
              className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center text-lg"
            >
              {isLoading ? <LoadingSpinner /> : 'ذخیره و شروع'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ApiKeyPrompt;
