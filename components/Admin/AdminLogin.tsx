
import React, { useState } from 'react';
import { adminLogin } from '../../api/admin';
import Card from '../shared/Card';
import LoadingSpinner from '../shared/LoadingSpinner';
import { ShieldCheckIcon, KeyIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

interface AdminLoginProps {
    onLogin: (token: string) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const data = await adminLogin(email, password);
            if (data.token) {
                localStorage.setItem('adminToken', data.token);
                onLogin(data.token);
            }
        } catch (err: any) {
            setError(err.message || 'خطا در ورود به سیستم');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-full max-w-md animate-fade-in">
                <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 bg-[#F5C542]/10 rounded-full flex items-center justify-center border border-[#F5C542]/20 mb-4">
                        <ShieldCheckIcon className="h-8 w-8 text-[#F5C542]" />
                    </div>
                    <h1 className="text-2xl font-black text-white uppercase tracking-tighter">
                        پنل <span className="text-[#F5C542]">مدیریت سیستم</span>
                    </h1>
                    <p className="text-xs text-gray-500 font-bold mt-2 uppercase tracking-widest">مخصوص پرسنل مجاز (Authorized Personnel)</p>
                </div>

                <Card className="border-2 border-gray-800 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-[0.65rem] font-black text-gray-500 mb-1.5 ms-1 uppercase tracking-widest">ایمیل مدیریت</label>
                            <div className="relative">
                                <EnvelopeIcon className="h-5 w-5 text-gray-600 absolute left-3 top-3.5" />
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-3 pl-10 focus:outline-none focus:ring-1 focus:ring-[#F5C542] text-white transition-all text-sm text-left"
                                    placeholder="admin@fitpro.ir"
                                    dir="ltr"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[0.65rem] font-black text-gray-500 mb-1.5 ms-1 uppercase tracking-widest">کلید امنیتی</label>
                            <div className="relative">
                                <KeyIcon className="h-5 w-5 text-gray-600 absolute left-3 top-3.5" />
                                <input 
                                    type="password" 
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-3 pl-10 focus:outline-none focus:ring-1 focus:ring-[#F5C542] text-white transition-all text-sm text-left"
                                    placeholder="••••••••"
                                    dir="ltr"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-xs font-bold text-center">
                                {error}
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full bg-[#F5C542] hover:bg-[#e6b83b] text-black font-black py-4 rounded-xl transition-all shadow-lg uppercase text-xs tracking-widest flex items-center justify-center"
                        >
                            {isLoading ? <LoadingSpinner /> : 'احراز هویت و ورود'}
                        </button>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default AdminLogin;
