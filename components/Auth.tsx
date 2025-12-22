
import React, { useState } from 'react';
import { signUp, login, resetPasswordRequest } from '../utils/authService';
import { User } from '../types';
import Card from './shared/Card';
import LoadingSpinner from './shared/LoadingSpinner';
import { EnvelopeIcon, KeyIcon, UserIcon, CheckCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import Logo from './shared/Logo';

interface AuthProps {
  onLoginSuccess: (user: User) => void;
}

type AuthMode = 'login' | 'register' | 'forgot' | 'verify-sent';

const Auth: React.FC<AuthProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const user = await login(email, password);
        onLoginSuccess(user);
      } else if (mode === 'register') {
        if (password !== confirmPassword) {
          throw new Error('رمز عبور و تایید آن مطابقت ندارند.');
        }
        await signUp(email, password, firstName, lastName);
        setMode('verify-sent');
      } else if (mode === 'forgot') {
        await resetPasswordRequest(email);
        setMode('verify-sent');
      }
    } catch (err: any) {
      setError(err.message || 'خطایی رخ داد.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses = "w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#F5C542]/50 transition-all placeholder:text-gray-600 text-white font-medium";
  const labelClasses = "block text-[0.65rem] font-black text-gray-500 mb-1.5 ms-1 uppercase tracking-widest";
  
  if (mode === 'verify-sent') {
    return (
      <div className="max-w-md mx-auto animate-fade-in mt-16">
        <Card className="text-center py-12 border-2 border-[#F5C542]/20">
          <div className="h-20 w-20 bg-[#F5C542]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="h-10 w-10 text-[#F5C542]" />
          </div>
          <h2 className="text-2xl font-brand font-black text-white mb-4 uppercase">لینک تایید ارسال شد</h2>
          <p className="text-gray-400 mb-8 leading-relaxed px-4 text-sm">
            لطفاً صندوق ورودی ایمیل خود را برای تایید حساب کاربری بررسی کنید.
          </p>
          <button 
            onClick={() => setMode('login')}
            className="text-[#F5C542] font-black text-xs uppercase hover:underline flex items-center justify-center gap-2 mx-auto tracking-widest"
          >
            <ArrowRightIcon className="h-4 w-4" />
            بازگشت به ورود
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto animate-fade-in mt-10 md:mt-16">
      <div className="flex justify-center mb-10">
        <Logo size="lg" />
      </div>

      <div className="text-center mb-10">
        <h1 className="text-2xl font-brand font-black text-white tracking-tighter uppercase">
          {mode === 'login' ? 'ورود امن به سیستم' : mode === 'register' ? 'عضویت در سطح ویژه' : 'بازیابی دسترسی'}
        </h1>
        <div className="h-1 w-12 bg-[#F5C542] mx-auto mt-2"></div>
      </div>

      <Card className="shadow-2xl border-gray-800 border-2">
        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === 'register' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClasses}>نام</label>
                <div className="relative">
                  <UserIcon className="h-5 w-5 text-gray-700 absolute left-3 top-3.5" />
                  <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className={`${inputClasses} pl-10`} placeholder="نام" required disabled={isLoading} />
                </div>
              </div>
              <div>
                <label className={labelClasses}>نام خانوادگی</label>
                <div className="relative">
                  <UserIcon className="h-5 w-5 text-gray-700 absolute left-3 top-3.5" />
                  <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className={`${inputClasses} pl-10`} placeholder="خانوادگی" required disabled={isLoading} />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className={labelClasses}>ایمیل کاربری</label>
            <div className="relative">
              <EnvelopeIcon className="h-5 w-5 text-gray-700 absolute left-3 top-3.5" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={`${inputClasses} pl-10`} placeholder="name@example.com" dir="ltr" required disabled={isLoading} />
            </div>
          </div>

          {mode !== 'forgot' && (
            <>
              <div>
                <label className={labelClasses}>رمز عبور امن</label>
                <div className="relative">
                  <KeyIcon className="h-5 w-5 text-gray-700 absolute left-3 top-3.5" />
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} className={`${inputClasses} pl-10`} placeholder="••••••••" dir="ltr" required disabled={isLoading} />
                </div>
              </div>
              {mode === 'register' && (
                <div>
                  <label className={labelClasses}>تکرار رمز عبور</label>
                  <div className="relative">
                    <KeyIcon className="h-5 w-5 text-gray-700 absolute left-3 top-3.5" />
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={`${inputClasses} pl-10`} placeholder="••••••••" dir="ltr" required disabled={isLoading} />
                  </div>
                </div>
              )}
            </>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-[0.7rem] font-bold text-center uppercase">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#F5C542] hover:bg-[#e6b83b] text-black font-brand font-black py-4 rounded-xl transition-all shadow-xl disabled:opacity-50 uppercase tracking-widest text-sm"
          >
            {isLoading ? <LoadingSpinner /> : (mode === 'login' ? 'ورود به حساب' : mode === 'register' ? 'ساخت حساب ویژه' : 'ارسال لینک')}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-800 flex flex-col gap-4 text-center">
          {mode === 'login' ? (
            <>
              <button onClick={() => setMode('forgot')} className="text-[0.6rem] font-black text-gray-500 hover:text-[#F5C542] transition-colors uppercase tracking-widest">فراموشی اطلاعات ورود؟</button>
              <p className="text-[0.7rem] text-gray-600 font-bold uppercase tracking-widest">
                حساب کاربری ندارید؟ <button onClick={() => setMode('register')} className="text-[#F5C542] hover:underline">ثبت نام ویژه</button>
              </p>
            </>
          ) : (
            <p className="text-[0.7rem] text-gray-600 font-bold uppercase tracking-widest">
              قبلاً عضو شده‌اید؟ <button onClick={() => setMode('login')} className="text-[#F5C542] hover:underline">ورود</button>
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Auth;
