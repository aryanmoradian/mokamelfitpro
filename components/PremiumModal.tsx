
import React, { useState, useEffect, useRef } from 'react';
import { 
    CheckBadgeIcon, 
    StarIcon, 
    XMarkIcon, 
    BanknotesIcon, 
    ArrowTopRightOnSquareIcon,
    ClipboardDocumentCheckIcon,
    QrCodeIcon,
    WalletIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    PhotoIcon
} from '@heroicons/react/24/solid';
import LoadingSpinner from './shared/LoadingSpinner';
import * as authService from '../utils/authService';
import { submitPayment, getUserPaymentStatus } from '../utils/paymentService';
import { fileToBase64 } from '../utils/fileUtils';

interface PremiumModalProps {
    onUpgrade: () => Promise<void>;
    onClose: () => void;
}

// Wallet Configuration
const WALLET_ADDRESS = "TYkGprD7ADrGxLsG1BAGvY1H5XnsrQbhxG";
const NETWORK = "USDT - TRC20 (Tron)";
const AMOUNT = "1 USDT";
const EXCHANGE_LINK = "https://ok-ex.io/buy-and-sell/USDT/?refer=224384";

const PremiumModal: React.FC<PremiumModalProps> = ({ onUpgrade, onClose }) => {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [isLoading, setIsLoading] = useState(false);
    const [txId, setTxId] = useState('');
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [error, setError] = useState('');
    const [copySuccess, setCopySuccess] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const user = authService.getCurrentUser();
        if(user) {
            const status = getUserPaymentStatus(user.id);
            setPaymentStatus(status);
        }
    }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText(WALLET_ADDRESS);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setReceiptFile(e.target.files[0]);
        }
    };

    const handleSubmitPayment = async () => {
        if(!txId.trim() || txId.length < 10) {
            setError('لطفاً شناسه تراکنش (TXID) معتبر وارد کنید.');
            return;
        }

        const user = authService.getCurrentUser();
        if(!user) return;

        setIsLoading(true);
        setError('');
        
        try {
            let receiptBase64;
            if (receiptFile) {
                const base64 = await fileToBase64(receiptFile);
                receiptBase64 = `data:${receiptFile.type};base64,${base64}`;
            }

            await submitPayment(user, txId, receiptBase64);
            setPaymentStatus('pending');
            setStep(1); 
        } catch (e: any) {
            setError(e.message || 'خطا در ثبت تراکنش');
        } finally {
            setIsLoading(false);
        }
    };

    if (paymentStatus === 'pending') {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-fade-in">
                <div className="w-full max-w-md bg-[#1A1A1A] border border-[#F5C542]/30 rounded-3xl p-8 text-center relative overflow-hidden">
                    <button onClick={onClose} className="absolute top-4 left-4 text-gray-500 hover:text-white"><XMarkIcon className="h-6 w-6" /></button>
                    
                    <div className="mx-auto w-20 h-20 bg-[#F5C542]/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
                        <ArrowPathIcon className="h-10 w-10 text-[#F5C542] animate-spin" />
                    </div>
                    
                    <h2 className="text-2xl font-black text-white mb-2">در انتظار تایید</h2>
                    <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                        تراکنش شما با موفقیت ثبت شد و هم‌اکنون توسط تیم مالی فیت پرو در حال بررسی است. به محض تایید، حساب شما به صورت خودکار به <span className="text-[#F5C542]">ELITE</span> ارتقا می‌یابد.
                    </p>
                    
                    <div className="bg-gray-800 rounded-xl p-4 mb-6">
                        <p className="text-xs text-gray-500 mb-1">کد پیگیری شما</p>
                        <p className="font-mono text-cyan-400 font-bold truncate">{(txId || 'Processing...').substring(0,20)}...</p>
                    </div>

                    <button onClick={onClose} className="w-full bg-[#1A1A1A] border border-gray-700 text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-colors">
                        متوجه شدم
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-fade-in overflow-y-auto">
            <div className="relative w-full max-w-lg bg-[#1A1A1A] border-2 border-[#F5C542] rounded-3xl shadow-[0_0_50px_rgba(245,197,66,0.2)] overflow-hidden my-4">
                
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#F5C542]/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

                <div className="flex justify-between items-start p-6">
                    <button onClick={onClose} className="p-2 bg-gray-900 rounded-full text-gray-500 hover:text-white transition-colors z-20">
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                    <div className="flex items-center gap-2 px-3 py-1 bg-[#F5C542]/20 rounded-full border border-[#F5C542]/20">
                        <StarIcon className="h-4 w-4 text-[#F5C542]" />
                        <span className="text-xs font-bold text-[#F5C542] uppercase">مرحله {step} از 3</span>
                    </div>
                </div>

                <div className="px-6 pb-8">
                    {step === 1 && (
                        <div className="animate-fade-in text-center">
                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">
                                فعال‌سازی سطح <span className="text-[#F5C542]">ELITE</span>
                            </h2>
                            <p className="text-gray-400 text-sm mb-8">پتانسیل کامل بدن خود را با هوش مصنوعی آزاد کنید.</p>

                            <div className="space-y-4 mb-8 text-right bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
                                <FeatureItem text="دسترسی نامحدود به هوش مصنوعی ساسکا" />
                                <FeatureItem text="نمایش دوز دقیق و زمان‌بندی مکمل‌ها" />
                                <FeatureItem text="هشدارهای تداخل دارویی پیشرفته" />
                                <FeatureItem text="اولویت در پشتیبانی متخصصین" />
                            </div>

                            <div className="bg-gradient-to-r from-[#F5C542] to-[#b88f1f] p-1 rounded-xl mb-4">
                                <div className="bg-black rounded-lg p-4 flex justify-between items-center">
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase font-bold">هزینه اشتراک ماهانه</p>
                                        <p className="text-2xl font-black text-white">1.00 <span className="text-[#F5C542] text-sm">USDT</span></p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-gray-500 line-through">10 USDT</p>
                                        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded">۹۰٪ تخفیف</span>
                                    </div>
                                </div>
                            </div>

                            <button onClick={() => setStep(2)} className="w-full bg-[#F5C542] hover:bg-[#e6b83b] text-black font-black py-4 rounded-xl text-lg uppercase transition-transform transform hover:scale-[1.02] shadow-xl flex items-center justify-center gap-2">
                                <BanknotesIcon className="h-6 w-6" />
                                خرید اشتراک (تتر)
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-fade-in">
                            <h2 className="text-xl font-black text-white mb-6 text-center">اطلاعات پرداخت</h2>

                            <div className="bg-blue-600/10 border border-blue-600/30 rounded-xl p-4 mb-6 flex items-start gap-3">
                                <WalletIcon className="h-6 w-6 text-blue-400 flex-shrink-0 mt-1" />
                                <div>
                                    <h4 className="font-bold text-blue-400 text-sm mb-1">نداشتن کیف پول؟</h4>
                                    <p className="text-xs text-gray-300 mb-2">برای پرداخت باید در صرافی ثبت‌نام کرده و تتر (USDT) خریداری کنید.</p>
                                    <a href={EXCHANGE_LINK} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-black bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition-colors">
                                        ورود به صرافی اوکی اکسچنج <ArrowTopRightOnSquareIcon className="h-3 w-3" />
                                    </a>
                                </div>
                            </div>

                            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 text-center mb-6 relative group">
                                <div className="absolute top-3 right-3 text-xs text-gray-500 font-mono">{NETWORK}</div>
                                <QrCodeIcon className="h-12 w-12 text-[#F5C542] mx-auto mb-3 opacity-80" />
                                <p className="text-xs text-gray-500 font-bold uppercase mb-2">آدرس کیف پول (TRC20)</p>
                                
                                <div onClick={handleCopy} className="bg-black border border-gray-700 rounded-lg p-3 flex items-center justify-between cursor-pointer hover:border-[#F5C542] transition-colors">
                                    <code className="text-[#F5C542] font-mono text-xs break-all text-left flex-1 ml-2">{WALLET_ADDRESS}</code>
                                    {copySuccess ? <CheckCircleIcon className="h-5 w-5 text-green-500" /> : <ClipboardDocumentCheckIcon className="h-5 w-5 text-gray-500" />}
                                </div>
                                <p className="text-[10px] text-gray-500 mt-2">مبلغ دقیق <span className="text-white font-bold">{AMOUNT}</span> را به آدرس بالا واریز کنید.</p>
                                <p className="text-[10px] text-red-400 mt-1 font-bold">دقت کنید شبکه انتقال TRC20 باشد (کارمزد انتقال داخلی صفر است).</p>
                            </div>

                            <div className="flex gap-3">
                                <button onClick={() => setStep(1)} className="flex-1 bg-gray-800 text-gray-300 font-bold py-3 rounded-xl text-sm">بازگشت</button>
                                <button onClick={() => setStep(3)} className="flex-[2] bg-[#F5C542] text-black font-black py-3 rounded-xl text-sm hover:bg-[#e6b83b]">واریز کردم، مرحله بعد</button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="animate-fade-in">
                            <h2 className="text-xl font-black text-white mb-6 text-center">ثبت رسید تراکنش</h2>
                            
                            <div className="space-y-4 mb-6">
                                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">شناسه تراکنش (TXID / Hash)</label>
                                    <input 
                                        type="text" 
                                        value={txId}
                                        onChange={(e) => setTxId(e.target.value)}
                                        placeholder="مثال: 70d40e94..."
                                        className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white font-mono text-sm focus:border-[#F5C542] focus:outline-none transition-colors"
                                    />
                                    <p className="text-[10px] text-gray-500 mt-2">کد پیگیری تراکنش را از تاریخچه برداشت صرافی کپی کنید.</p>
                                </div>

                                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">تصویر رسید (اختیاری)</label>
                                    <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border border-dashed border-gray-700 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-800 transition-colors flex flex-col items-center justify-center gap-2"
                                    >
                                        {receiptFile ? (
                                            <>
                                                <CheckCircleIcon className="h-6 w-6 text-green-500" />
                                                <span className="text-xs text-white">{receiptFile.name}</span>
                                                <span className="text-[10px] text-gray-500">برای تغییر کلیک کنید</span>
                                            </>
                                        ) : (
                                            <>
                                                <PhotoIcon className="h-6 w-6 text-gray-500" />
                                                <span className="text-xs text-gray-400">آپلود اسکرین‌شات رسید</span>
                                            </>
                                        )}
                                        <input 
                                            ref={fileInputRef}
                                            type="file" 
                                            className="hidden" 
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs text-center font-bold">
                                    {error}
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button onClick={() => setStep(2)} className="flex-1 bg-gray-800 text-gray-300 font-bold py-3 rounded-xl text-sm">بازگشت</button>
                                <button 
                                    onClick={handleSubmitPayment} 
                                    disabled={isLoading}
                                    className="flex-[2] bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-black py-3 rounded-xl text-sm shadow-lg flex justify-center items-center"
                                >
                                    {isLoading ? <LoadingSpinner /> : 'تایید و ارسال برای بررسی'}
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

const FeatureItem = ({ text }: { text: string }) => (
    <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#F5C542]/20 flex items-center justify-center">
            <CheckBadgeIcon className="h-3 w-3 text-[#F5C542]" />
        </div>
        <span className="text-gray-300 font-medium text-xs">{text}</span>
    </div>
);

export default PremiumModal;
