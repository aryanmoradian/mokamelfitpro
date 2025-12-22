
import React, { useState, useEffect, useRef } from 'react';
import { AnalysisResult, ChatMessage, WaterReminderSettings, UserEvent, User } from '../types';
import Card from './shared/Card';
import Chatbot from './Chatbot';
import ImageTools from './ImageTools';
import HistoryChart from './HistoryChart';
import ActivityTimeline from './ActivityTimeline';
import PremiumModal from './PremiumModal';
import {
    SparklesIcon, ChatBubbleLeftRightIcon, PhotoIcon, ArrowPathIcon, MusicalNoteIcon, BeakerIcon, BoltIcon, HeartIcon, ShieldCheckIcon, XMarkIcon, ExclamationTriangleIcon, StarIcon as StarIconOutline, ChevronDownIcon, ShareIcon, CheckCircleIcon as CheckCircleIconOutline, Cog6ToothIcon, UsersIcon, PhoneIcon, FireIcon, SunIcon, MoonIcon, ClockIcon, LockClosedIcon, StarIcon as StarIconSolidIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid, CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';
import { playAudio } from '../utils/audioUtils';
import { generateSpeech } from '../services/geminiService';
import * as authService from '../utils/authService';
import { getUserEvents } from '../services/eventService';

interface DashboardProps {
  analysisResult: AnalysisResult;
  analysisHistory: AnalysisResult[];
  currentAnalysisIndex: number;
  onSwitchAnalysis: (index: number) => void;
  onUpdateAnalysis: (updatedAnalysis: AnalysisResult) => void;
  onReset: () => void;
}

type Tab = 'formula' | 'chat' | 'image' | 'activity' | 'security';

const translationMap: { [key: string]: string } = {
  low: 'پایین',
  moderate: 'متوسط',
  high: 'بالا',
  poor: 'ضعیف',
  average: 'متوسط',
  good: 'خوب',
  sleep: 'خواب',
  nutrition: 'تغذیه',
  general_health: 'سلامت عمومی'
};

const WhatsAppIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.267.651 4.383 1.905 6.344l-1.191 4.363 4.542-1.187z" /></svg>
);

const TelegramIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M24 0l-6 22-8.129-7.239 7.802-8.234-10.458 7.227-7.215-2.428 24-11.326z" /></svg>
);

const getSupplementIcon = (name: string): React.ElementType => {
    const lowerName = name.toLowerCase();
    const mappings = [
        { keywords: ['vitamin d', 'ویتامین دی', 'ویتامین d', 'sun', 'آفتاب'], icon: SunIcon },
        { keywords: ['zma', 'melatonin', 'sleep', 'night', 'magnesium', 'zinc', 'خواب', 'ملاتونین', 'منیزیم', 'روی', 'زینک'], icon: MoonIcon },
        { keywords: ['fat burner', 'carnitine', 'cla', 'thermogenic', 'shred', 'چربی سوز', 'کارنیتین', 'لاغری', 'سی ال ای'], icon: FireIcon },
        { keywords: ['creatine', 'caffeine', 'pre-workout', 'preworkout', 'energy', 'beta', 'pump', 'nitric', 'کراتین', 'کافئین', 'انرژی', 'پمپ', 'بتا', 'نیتریک'], icon: BoltIcon },
        { keywords: ['protein', 'whey', 'casein', 'gainer', 'mass', 'amino', 'bcaa', 'glutamine', 'hmb', 'iso', 'hydro', 'پروتئین', 'وی', 'کازئین', 'گینر', 'آمینو', 'گلوتامین'], icon: ShieldCheckIcon },
        { keywords: ['omega', 'fish', 'multivitamin', 'vitamin', 'health', 'joint', 'glucosamine', 'mineral', 'امگا', 'ماهی', 'مولتی', 'ویتامین', 'سلامت', 'مفاصل', 'مینرال'], icon: HeartIcon },
    ];
    for (const group of mappings) {
        if (group.keywords.some(k => lowerName.includes(k))) {
            return group.icon;
        }
    }
    return BeakerIcon;
};

const StarRating = ({ rating, onRate }: { rating: number, onRate: (newRating: number) => void }) => {
    return (
        <div className="flex items-center gap-1" dir="ltr">
            {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => onRate(star)} className="transition-transform hover:scale-110">
                    {star <= rating ? (
                        <StarIconSolid className="h-5 w-5 text-[#F5C542]" />
                    ) : (
                        <StarIconOutline className="h-5 w-5 text-gray-700" />
                    )}
                </button>
            ))}
        </div>
    );
};

const FormulaFitCard = ({ code }: { code: string }) => (
    <div className="relative overflow-hidden rounded-2xl bg-[#1A1A1A] border-2 border-[#F5C542]/20 shadow-2xl p-6 group transition-all duration-500 hover:border-[#F5C542]/40 gold-glow">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#F5C542]/5 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#F5C542]/5 rounded-full blur-3xl -ml-24 -mb-24 pointer-events-none"></div>
        <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="flex flex-col">
                <span className="font-brand font-black text-2xl text-white tracking-tighter uppercase">MOKAMMEL</span>
                <span className="font-brand font-bold text-xs text-[#F5C542] tracking-[0.3em] -mt-1 uppercase">FIT PRO ELITE</span>
            </div>
            <div className="p-2 bg-[#F5C542]/10 border border-[#F5C542]/30 rounded-lg">
                <BoltIcon className="w-6 h-6 text-[#F5C542] animate-pulse" />
            </div>
        </div>
        <div className="relative z-10 my-6 text-center">
            <p className="text-[0.6rem] font-bold text-gray-500 tracking-[0.4em] mb-2 uppercase">کد شناسایی ژنتیکی مکمل</p>
            <div className="inline-block relative px-8 py-3 bg-black/40 rounded-xl border border-[#F5C542]/10">
                 <p className="relative text-4xl sm:text-5xl font-brand font-black text-white tracking-widest" dir="ltr">
                    {code}
                 </p>
            </div>
        </div>
        <div className="relative z-10 flex justify-between items-center border-t border-gray-800 pt-4 mt-2">
            <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-[#F5C542] animate-pulse shadow-[0_0_8px_#F5C542]"></div>
                 <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">تایید هوش مصنوعی ساسکا</span>
            </div>
            <div className="h-4 w-1 bg-gray-800"></div>
            <span className="text-[8px] text-gray-600 font-brand">CRYPTOGRAPHIC BODY HASH V2.1</span>
        </div>
    </div>
);

const Dashboard: React.FC<DashboardProps> = ({
    analysisResult,
    analysisHistory,
    currentAnalysisIndex,
    onSwitchAnalysis,
    onUpdateAnalysis,
    onReset
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('formula');
  const [user, setUser] = useState<User | null>(authService.getCurrentUser());
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // Destructure from the NEW Structure
  const { formula, stacks, alerts } = analysisResult;
  const summary = formula.summary; // New summary object

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showContactOptionsModal, setShowContactOptionsModal] = useState(false);
  const [expandedStackIndex, setExpandedStackIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [showWaterReminderModal, setShowWaterReminderModal] = useState(false);
  const [waterReminderSettings, setWaterReminderSettings] = useState<WaterReminderSettings>({ enabled: false, interval: 60, message: 'یادت نره آب بنوشی!' });
  const [tempWaterSettings, setTempWaterSettings] = useState<WaterReminderSettings>({ enabled: false, interval: 60, message: 'یادت نره آب بنوشی!' });
  const [showReminderToast, setShowReminderToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [events, setEvents] = useState<UserEvent[]>([]);
  const reminderIntervalRef = useRef<number | null>(null);

  // Paywall Logic: Check if user is Premium or Admin
  const isPremium = user?.role === 'premium' || user?.role === 'admin';

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    if (currentUser) {
        const settings = authService.getWaterReminderSettings(currentUser.id);
        setWaterReminderSettings(settings);
        setEvents(getUserEvents(currentUser.id));
    }
  }, [activeTab]); // Refresh on tab change to catch role updates

  const handleUpgradeSuccess = async () => {
    if (user) {
        await authService.upgradeToPremium(user.id);
        const updatedUser = authService.getCurrentUser();
        setUser(updatedUser);
        setShowPremiumModal(false);
        setToastMessage("تبریک! اشتراک Premium فعال شد.");
        setShowReminderToast(true);
        setTimeout(() => setShowReminderToast(false), 3000);
    }
  };

  useEffect(() => {
    if (reminderIntervalRef.current) {
        clearInterval(reminderIntervalRef.current);
    }
    if (waterReminderSettings.enabled) {
        reminderIntervalRef.current = window.setInterval(() => {
            setToastMessage(waterReminderSettings.message);
            setShowReminderToast(true);
            setTimeout(() => setShowReminderToast(false), 5000);
        }, waterReminderSettings.interval * 60 * 1000);
    }
    return () => {
        if (reminderIntervalRef.current) {
            clearInterval(reminderIntervalRef.current);
        }
    };
  }, [waterReminderSettings]);

  const handleOpenWaterReminderSettings = () => {
    setTempWaterSettings(waterReminderSettings);
    setShowWaterReminderModal(true);
  };

  const handleSaveWaterReminderSettings = () => {
    setWaterReminderSettings(tempWaterSettings);
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
        authService.saveWaterReminderSettings(currentUser.id, tempWaterSettings);
    }
    setShowWaterReminderModal(false);
    setToastMessage("تنظیمات یادآور ذخیره شد.");
    setShowReminderToast(true);
    setTimeout(() => setShowReminderToast(false), 3000);
  };

  const handleRatingChange = (stackIndex: number, newRating: number) => {
    const updatedStacks = [...analysisResult.stacks];
    updatedStacks[stackIndex].rating = updatedStacks[stackIndex].rating === newRating ? 0 : newRating;
    const newAnalysis = { ...analysisResult, stacks: updatedStacks };
    onUpdateAnalysis(newAnalysis);
  };
  
  const handleToggleStack = (index: number) => {
    setExpandedStackIndex(prevIndex => (prevIndex === index ? null : index));
  };

  const handleToggleCompleted = (stackIndex: number) => {
    const updatedStacks = [...analysisResult.stacks];
    const stack = { ...updatedStacks[stackIndex] }; 
    stack.isCompleted = !stack.isCompleted;
    updatedStacks[stackIndex] = stack;
    const newAnalysis = { ...analysisResult, stacks: updatedStacks };
    onUpdateAnalysis(newAnalysis);
  };

  const handleSpeak = async (text: string) => {
    setIsSpeaking(true);
    try {
        const audio = await generateSpeech(text);
        await playAudio(audio);
    } catch(e) {
        console.error("TTS failed", e);
    } finally {
        setIsSpeaking(false);
    }
  };
  
  const handleContactClick = (url: string) => {
    setShowContactModal(true);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShare = () => {
    const shareText = `
*تحلیل MOKAMMEL FIT PRO*
*کد فرمول:* ${formula.code}
*مکمل‌های پیشنهادی:*
${stacks.map(s => `- ${s.name}`).join('\n')}
*نکات کلیدی:*
${alerts.map(a => `- ${a.message}`).join('\n')}
_قدرت گرفته از هوش مصنوعی ساسکا_
    `.trim().replace(/    /g, '');
    navigator.clipboard.writeText(shareText).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
  };

  const tabs: { id: Tab; name: string; icon: React.ElementType }[] = [
    { id: 'formula', name: 'آنالیز بدن', icon: SparklesIcon },
    { id: 'chat', name: 'ساسکا چت', icon: ChatBubbleLeftRightIcon },
    { id: 'image', name: 'ابزار ویژن', icon: PhotoIcon },
    { id: 'activity', name: 'فعالیت‌ها', icon: ClockIcon },
    { id: 'security', name: 'امنیت', icon: LockClosedIcon },
  ];
  
  const initialChatHistory: ChatMessage[] = [{
      role: 'model',
      parts: [{ text: `درود! من ساسکا، مربی هوشمند فیت پرو هستم. فرمول شما با کد ${formula.code} با موفقیت ایجاد شد. حالا می‌توانید سوالات خود را بپرسید.` }],
      timestamp: Date.now(),
  },
  ...alerts.map(a => ({
      role: 'model' as const,
      parts: [{text: `**${a.type.toUpperCase()} ALERT**\n${a.message}`}],
      timestamp: Date.now(),
  }))
  ];

  const AnalysisCard = ({ title, value, unit }: { title: string, value: string | number, unit?: string }) => {
    const [displayValue, setDisplayValue] = useState(typeof value === 'number' ? 0 : value);
    useEffect(() => {
        if (typeof value === 'number') {
            let start = 0;
            const duration = 1500;
            let startTime: number | null = null;
            const step = (timestamp: number) => {
                if (!startTime) startTime = timestamp;
                const progress = Math.min((timestamp - startTime) / duration, 1);
                setDisplayValue(Math.floor(progress * (value - start) + start));
                if (progress < 1) {
                    window.requestAnimationFrame(step);
                }
            };
            window.requestAnimationFrame(step);
        } else {
            setDisplayValue(value);
        }
    }, [value]);
      return (
          <div className="text-center bg-[#1A1A1A] border border-gray-800 rounded-xl p-4 transition-all hover:border-[#F5C542]/20">
              <h3 className="text-[0.65rem] font-black text-gray-500 uppercase tracking-widest">{title}</h3>
              <p className="text-xl font-black text-white mt-1">
                  {displayValue} <span className="text-xs font-normal text-gray-400">{unit}</span>
              </p>
          </div>
      )
  };

  return (
    <div className="pb-10">
      {showPremiumModal && (
        <PremiumModal onUpgrade={handleUpgradeSuccess} onClose={() => setShowPremiumModal(false)} />
      )}

      {showContactModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={() => setShowContactModal(false)}>
            <div className="bg-[#1A1A1A] rounded-2xl p-8 max-w-sm w-full mx-4 text-center border border-[#F5C542]/20 shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-end">
                    <button onClick={() => setShowContactModal(false)} className="text-gray-500 hover:text-white transition-colors">
                        <XMarkIcon className="h-6 w-6"/>
                    </button>
                </div>
                <div className="h-16 w-16 bg-[#F5C542]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircleIconSolid className="h-10 w-10 text-[#F5C542]" />
                </div>
                <h3 className="text-2xl font-brand font-black text-white mb-3 uppercase">FIT PRO ORDER</h3>
                <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                    نسخه فیت پرو شما ثبت شد. متخصصین ما در حال بررسی نهایی هستند. لطفاً گفتگو را برای دریافت لینک خرید اختصاصی ادامه دهید.
                </p>
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg mb-6">
                    <p className="text-[0.7rem] text-red-400 font-black uppercase">توجه: پیشنهاد برای ۲۰ دقیقه معتبر است</p>
                </div>
                <button onClick={() => setShowContactModal(false)} className="w-full bg-[#F5C542] hover:bg-[#e6b83b] text-black font-black py-3 rounded-xl transition-all uppercase tracking-tighter">
                    متوجه شدم
                </button>
            </div>
        </div>
      )}

      {showContactOptionsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={() => setShowContactOptionsModal(false)}>
            <div className="bg-[#1A1A1A] rounded-2xl p-8 max-w-sm w-full mx-4 border border-[#F5C542]/20 shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-brand font-black text-white uppercase tracking-tighter">ارتباط با متخصص</h3>
                    <button onClick={() => setShowContactOptionsModal(false)} className="text-gray-500 hover:text-white">
                        <XMarkIcon className="h-6 w-6"/>
                    </button>
                </div>
                <div className="space-y-4">
                    <button onClick={() => { setShowContactOptionsModal(false); handleContactClick('https://wa.me/9981749697'); }} className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-4 rounded-xl transition-all flex items-center justify-center gap-3">
                        <WhatsAppIcon />
                        <span>مشاور واتس‌اپ</span>
                    </button>
                    <button onClick={() => { setShowContactOptionsModal(false); handleContactClick('http://t.me/mokamelfitpro_support'); }} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl transition-all flex items-center justify-center gap-3">
                        <TelegramIcon />
                        <span>پشتیبانی تلگرام</span>
                    </button>
                    <a href="tel:09981749697" className="w-full bg-gray-800 hover:bg-gray-700 text-white font-black py-4 rounded-xl transition-all flex items-center justify-center gap-3">
                        <PhoneIcon className="h-6 w-6" />
                        <span>تماس مستقیم</span>
                    </a>
                </div>
            </div>
        </div>
      )}

      <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <div className="flex flex-col text-center md:text-right">
            <h1 className="text-4xl font-brand font-black text-white tracking-tighter uppercase">
              داشبورد <span className="text-[#F5C542]">پیشرفته</span>
            </h1>
            <div className="h-1 w-20 bg-[#F5C542] mx-auto md:mx-0"></div>
        </div>
        <div className="flex items-center flex-wrap justify-center gap-3">
            <button onClick={() => setShowContactOptionsModal(true)} className="flex items-center text-xs bg-[#F5C542] hover:bg-[#e6b83b] text-black font-black py-2.5 px-5 rounded-lg transition-all shadow-lg gold-glow uppercase">
              <UsersIcon className="h-4 w-4 ml-2" />
              متخصص فیت پرو
            </button>
            <button onClick={handleShare} className="flex items-center text-xs bg-[#1A1A1A] border border-gray-800 hover:border-[#F5C542]/30 text-gray-300 font-black py-2.5 px-5 rounded-lg transition-all uppercase relative">
              <ShareIcon className="h-4 w-4 ml-2 text-[#F5C542]" />
              اشتراک‌گذاری
              {copied && <span className="absolute -top-7 right-0 bg-[#F5C542] text-black text-[0.6rem] font-black px-2 py-1 rounded animate-fade-in">کپی شد!</span>}
            </button>
            <button onClick={onReset} className="flex items-center text-xs bg-[#1A1A1A] border border-gray-800 hover:border-[#F5C542]/30 text-gray-300 font-black py-2.5 px-5 rounded-lg transition-all uppercase">
              <ArrowPathIcon className="h-4 w-4 ml-2 text-[#F5C542]" />
              آنالیز جدید
            </button>
        </div>
      </header>

      <div className="mb-8 overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex border-b border-gray-900 gap-8 min-w-max">
            {tabs.map((tab) => (
              <button key={tab.name} onClick={() => setActiveTab(tab.id)} className={`relative whitespace-nowrap py-4 px-2 font-brand font-black text-xs uppercase transition-all tracking-widest ${activeTab === tab.id ? 'text-[#F5C542]' : 'text-gray-500 hover:text-gray-300'}`}>
                <div className="flex items-center">
                    <tab.icon className={`h-4 w-4 ml-2 ${activeTab === tab.id ? 'text-[#F5C542]' : 'text-gray-600'}`} />
                    {tab.name}
                </div>
                {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#F5C542] shadow-[0_0_8px_#F5C542]"></div>}
              </button>
            ))}
        </div>
      </div>

      <div key={activeTab}>
        {activeTab === 'formula' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-8">
                <div className="animate-fade-in" style={{ animationDelay: '100ms' }}><FormulaFitCard code={formula.code} /></div>
                
                {/* Paywall Banner for Free Users */}
                {!isPremium && (
                    <div className="animate-fade-in" style={{ animationDelay: '150ms' }}>
                        <div onClick={() => setShowPremiumModal(true)} className="bg-gradient-to-r from-[#F5C542] to-[#b88f1f] rounded-2xl p-6 shadow-xl cursor-pointer hover:scale-[1.02] transition-transform relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
                            <div className="relative z-10 flex items-center justify-between">
                                <div>
                                    <h3 className="text-black font-black text-lg uppercase tracking-tight flex items-center gap-2">
                                        <LockClosedIcon className="h-5 w-5" />
                                        اشتراک ویژه ELITE
                                    </h3>
                                    <p className="text-black/80 text-xs font-bold mt-1 max-w-[200px]">مشاهده دوز دقیق، زمان مصرف و هشدارهای پیشرفته</p>
                                </div>
                                <div className="bg-black/20 p-2 rounded-lg">
                                    <StarIconSolid className="h-6 w-6 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
                    <Card className="bg-[#1A1A1A] border-gray-800 border-2">
                        <div className="flex items-center gap-3 mb-6">
                            <BeakerIcon className="h-6 w-6 text-[#F5C542]" />
                            <h2 className="text-lg font-brand font-black text-white uppercase tracking-tighter">تحلیل هوشمند بدنی</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <AnalysisCard title="نیاز پروتئین" value={translationMap[summary.proteinNeed] || summary.proteinNeed} />
                            <AnalysisCard title="نیاز کراتین" value={translationMap[summary.creatineNeed] || summary.creatineNeed} />
                            <AnalysisCard title="ریکاوری" value={translationMap[summary.recoveryStatus] || summary.recoveryStatus} />
                            <AnalysisCard title="استرس" value={translationMap[summary.stressLevel] || summary.stressLevel} />
                            <div className="col-span-2">
                                <AnalysisCard title="شاخص پتانسیل انرژی" value={summary.energyIndex} unit="/ 100" />
                            </div>
                        </div>
                    </Card>
                </div>
              {alerts && alerts.length > 0 && (
                <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
                    <div className={`bg-red-500/5 border-2 border-red-500/20 rounded-2xl p-6 relative ${!isPremium ? 'overflow-hidden' : ''}`}>
                         {!isPremium && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-4 text-center">
                                <LockClosedIcon className="h-8 w-8 text-red-500 mb-2" />
                                <p className="text-white font-bold text-sm">هشدارهای پزشکی قفل شده است</p>
                                <button onClick={() => setShowPremiumModal(true)} className="mt-2 text-[#F5C542] text-xs font-black uppercase underline">خرید اشتراک برای مشاهده</button>
                            </div>
                        )}
                        <div className="flex items-center gap-3 mb-6">
                            <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
                            <h2 className="text-lg font-brand font-black text-white uppercase tracking-tighter">هشدارهای ایمنی زیستی</h2>
                        </div>
                        <div className={`space-y-4 ${!isPremium ? 'blur-sm select-none' : ''}`}>
                            {alerts.map((alert, index) => (
                                <div key={index} className="p-4 bg-black/40 rounded-xl border border-red-500/10">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-red-400 text-sm uppercase">{alert.type} هشدار</h3>
                                        <button onClick={() => handleSpeak(`${alert.type}. ${alert.message}`)} disabled={isSpeaking || !isPremium} className="text-gray-600 hover:text-white transition-colors">
                                            <MusicalNoteIcon className="h-4 w-4"/>
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2 leading-relaxed">{alert.message}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
              )}
            </div>
            <div className="lg:col-span-2 animate-fade-in" style={{ animationDelay: '400ms' }}>
              <Card className="bg-[#1A1A1A] border-gray-800 border-2 h-full flex flex-col relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-1 bg-[#F5C542] elite-shimmer"></div>
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                     <div>
                        <h2 className="text-2xl font-brand font-black text-white uppercase tracking-tighter">استک مکمل اختصاصی</h2>
                        <p className="text-[0.6rem] font-bold text-gray-500 uppercase tracking-widest mt-1">طراحی شده توسط {formula.aiVersion}</p>
                     </div>
                     <div className="px-3 py-1 bg-[#F5C542] text-black text-[0.6rem] font-black rounded uppercase tracking-widest">طرح ویژه Premium</div>
                 </div>
                 
                 <div className="space-y-4 flex-grow">
                     {stacks.map((stack, index) => {
                         const isExpanded = expandedStackIndex === index;
                         const Icon = getSupplementIcon(stack.name);
                         return (
                            <div key={index} className={`bg-black/40 rounded-xl transition-all border-2 ${isExpanded ? 'border-[#F5C542]/50' : 'border-gray-800'} ${stack.isCompleted ? 'opacity-40' : ''}`}>
                                <div className="p-4 flex items-center gap-5">
                                  <div className={`p-3 rounded-lg flex-shrink-0 ${isExpanded ? 'bg-[#F5C542]/20' : 'bg-gray-900/50'}`}>
                                    <Icon className={`h-6 w-6 ${isExpanded ? 'text-[#F5C542]' : 'text-gray-500'}`} />
                                  </div>
                                  <button onClick={() => handleToggleStack(index)} className="w-full flex-1 text-right">
                                      <div className="flex justify-between items-center">
                                          <h3 className={`font-brand font-black text-base uppercase tracking-tighter ${isExpanded ? 'text-[#F5C542]' : 'text-white'}`}>{stack.name}</h3>
                                          <ChevronDownIcon className={`h-5 w-5 text-gray-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                      </div>
                                      <div className="flex items-center gap-4 mt-1">
                                          {isPremium ? (
                                              <>
                                                 <p className="text-[0.7rem] text-gray-400 font-bold uppercase tracking-widest">دوز مصرف: <span className="text-gray-200">{stack.dosage}</span></p>
                                                 {stack.priority && <p className="text-[0.7rem] text-amber-500 font-bold uppercase tracking-widest">اولویت: {stack.priority}</p>}
                                              </>
                                          ) : (
                                              <div className="flex items-center gap-2 text-red-500/70">
                                                  <LockClosedIcon className="h-3 w-3" />
                                                  <span className="text-[0.6rem] font-black uppercase tracking-widest">فقط PREMIUM</span>
                                              </div>
                                          )}
                                      </div>
                                  </button>
                                  <button onClick={() => handleToggleCompleted(index)} className="p-1 rounded-full text-gray-700 hover:text-[#F5C542] transition-colors">
                                    {stack.isCompleted ? <CheckCircleIconSolid className="h-7 w-7 text-[#F5C542]" /> : <CheckCircleIconOutline className="h-7 w-7" />}
                                  </button>
                                </div>
                                {isExpanded && (
                                    <div className="px-5 pb-5 animate-fade-in relative">
                                        {!isPremium && (
                                            <div className="absolute inset-0 bg-black/80 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center p-4 rounded-b-xl text-center">
                                                 <LockClosedIcon className="h-10 w-10 text-[#F5C542] mb-3" />
                                                 <p className="text-white font-bold text-sm">جزئیات مصرف قفل شده است</p>
                                                 <p className="text-gray-400 text-xs mt-1 mb-4">برای مشاهده دوز دقیق، زمان‌بندی و دلایل علمی، اشتراک تهیه کنید.</p>
                                                 <button onClick={() => setShowPremiumModal(true)} className="bg-[#F5C542] text-black font-black py-2 px-6 rounded-lg text-xs uppercase hover:bg-white transition-colors">خرید اشتراک</button>
                                            </div>
                                        )}
                                        <div className={`h-px bg-gray-800 mb-4 ${!isPremium ? 'opacity-20' : ''}`}></div>
                                        <div className={`space-y-4 ${!isPremium ? 'blur-sm select-none opacity-30' : ''}`}>
                                            <div>
                                                <div className="flex justify-between items-center mb-2">
                                                    <h4 className="text-[0.6rem] font-black text-gray-500 uppercase tracking-[0.2em]">استدلال علمی</h4>
                                                    <button onClick={() => handleSpeak(stack.reason)} disabled={isSpeaking || !isPremium} className="text-gray-600 hover:text-[#F5C542]">
                                                        <MusicalNoteIcon className="h-4 w-4"/>
                                                    </button>
                                                </div>
                                                <p className="text-sm text-gray-300 leading-relaxed font-medium">{stack.reason}</p>
                                            </div>
                                             <div>
                                                <h4 className="text-[0.6rem] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">زمان مصرف</h4>
                                                <p className="text-sm text-cyan-400 font-bold">{stack.timing}</p>
                                             </div>
                                            <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                                                <p className="text-[0.6rem] font-black text-gray-500 uppercase">امتیاز کاربران</p>
                                                <StarRating rating={stack.rating || 0} onRate={(newRating) => handleRatingChange(index, newRating)} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                         )
                    })}
                 </div>
                 
                 <div className="mt-10 bg-black/60 rounded-2xl p-6 border border-[#F5C542]/10 text-center">
                    <h3 className="font-brand font-black text-white text-lg uppercase tracking-tighter">نهایی‌سازی طرح ویژه</h3>
                    <p className="text-gray-400 text-xs mt-2 leading-relaxed">برای تایید نهایی بیولوژی و دریافت دوز دقیق، همین حالا با متخصصین تماس بگیرید.</p>
                     <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
                        <button onClick={() => handleContactClick('https://wa.me/9981749697')} className="bg-[#25D366] hover:bg-[#1fb355] text-white font-black py-4 px-8 rounded-xl transition-all flex items-center justify-center gap-3 uppercase text-xs">
                            <WhatsAppIcon />
                            مشاور واتس‌اپ
                        </button>
                        <button onClick={() => handleContactClick('http://t.me/mokamelfitpro_support')} className="bg-[#0088cc] hover:bg-[#0077b3] text-white font-black py-4 px-8 rounded-xl transition-all flex items-center justify-center gap-3 uppercase text-xs">
                            <TelegramIcon />
                            پشتیبانی تلگرام
                        </button>
                     </div>
                 </div>
              </Card>
            </div>
          </div>
        )}
        {activeTab === 'chat' && <Chatbot initialHistory={initialChatHistory} formulaCode={formula.code} />}
        {activeTab === 'image' && <ImageTools onUpdateAnalysis={onUpdateAnalysis} currentAnalysis={analysisResult} user={user} />}
        {activeTab === 'activity' && (
          <div className="animate-fade-in max-w-2xl mx-auto">
            <Card className="bg-[#1A1A1A] border-gray-800 border-2">
              <h2 className="text-2xl font-brand font-black text-white uppercase tracking-tighter mb-8 border-b border-gray-800 pb-4">گزارش فعالیت‌ها</h2>
              <ActivityTimeline events={events} />
            </Card>
          </div>
        )}
        {activeTab === 'security' && (
          <div className="animate-fade-in max-w-2xl mx-auto">
            <Card className="bg-[#1A1A1A] border-gray-800 border-2">
              <h2 className="text-2xl font-brand font-black text-white uppercase tracking-tighter mb-8 border-b border-gray-800 pb-4">پروتکل‌های امنیتی</h2>
              <div className="space-y-4">
                <div className="p-5 bg-black/40 border border-gray-800 rounded-xl flex items-center justify-between group hover:border-[#F5C542]/20 transition-all">
                  <div>
                    <h3 className="font-black text-white text-sm uppercase">رمز عبور دسترسی</h3>
                    <p className="text-[0.6rem] text-gray-500 font-bold uppercase mt-1">آخرین تغییر: ۹۰ روز پیش</p>
                  </div>
                  <button className="text-[#F5C542] font-black text-xs uppercase hover:underline">تغییر رمز</button>
                </div>
                <div className="p-5 bg-black/40 border border-gray-800 rounded-xl flex items-center justify-between group hover:border-[#F5C542]/20 transition-all">
                  <div>
                    <h3 className="font-black text-white text-sm uppercase">احراز هویت دو مرحله‌ای</h3>
                    <p className="text-[0.6rem] text-gray-500 font-bold uppercase mt-1">حفاظت هویتی چند لایه</p>
                  </div>
                  <button className="text-gray-600 font-black text-xs uppercase cursor-not-allowed">غیرفعال</button>
                </div>
                <div className="p-5 bg-red-500/5 border border-red-500/10 rounded-xl flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-red-500 text-sm uppercase">حذف حساب کاربری</h3>
                    <p className="text-[0.6rem] text-gray-500 font-bold uppercase mt-1">حذف دائمی تمام داده‌های زیستی</p>
                  </div>
                  <button className="text-red-500 font-black text-xs uppercase hover:underline">اجرای عملیات</button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
