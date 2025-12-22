
import React, { useState } from 'react';
import { QuizData } from '../types';
import Card from './shared/Card';
import LoadingSpinner from './shared/LoadingSpinner';
import { PencilSquareIcon, BeakerIcon, DocumentCheckIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

interface FormulaFitQuizProps {
  onSubmit: (data: QuizData) => void;
  isLoading: boolean;
  error: string | null;
}

const FormattedError = ({ message }: { message: string }) => {
    const lines = message.split('\n').map(line => line.trim()).filter(line => line);
    
    return (
        <div className="bg-red-900/50 border border-red-500/50 text-red-300 text-sm rounded-lg p-4 mt-4 text-right">
            {lines.map((line, index) => {
                const parts = line.split(/(\*\*.*?\*\*|`.*?`)/g);
                return (
                    <p key={index} className="mb-2 last:mb-0">
                        {parts.map((part, partIndex) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                                return <strong key={partIndex} className="font-bold text-red-200">{part.slice(2, -2)}</strong>;
                            }
                            if (part.startsWith('`') && part.endsWith('`')) {
                                return <code key={partIndex} className="bg-gray-700 text-amber-300 font-mono text-xs p-1 rounded-md" dir="ltr">{part.slice(1, -1)}</code>;
                            }
                            return part;
                        })}
                    </p>
                );
            })}
        </div>
    );
};

const questions = [
  { id: 'gender', label: 'جنسیت شما چیست؟', type: 'select', options: [{ value: 'male', label: 'مرد' }, { value: 'female', label: 'زن' }] },
  { id: 'goal', label: 'هدف اصلی شما از این برنامه چیست؟', type: 'select', options: [{ value: 'lose-fat', label: 'کاهش چربی' }, { value: 'build-muscle', label: 'عضله سازی' }, { value: 'maintain', label: 'حفظ وضعیت / سلامت' }] },
  { id: 'age', label: 'سن شما؟ (سال)', type: 'number', placeholder: 'مثلاً: ۲۸' },
  { id: 'weight', label: 'وزن فعلی (کیلوگرم)', type: 'number', placeholder: 'مثلاً: ۷۵' },
  { id: 'sleep', label: 'میانگین خواب شبانه (ساعت)', type: 'number', placeholder: 'مثلاً: ۷' },
  { id: 'exerciseLevel', label: 'سطح فعالیت ورزشی در هفته؟', type: 'select', options: [{ value: 'none', label: 'بدون ورزش' }, { value: 'light', label: 'سبک (۱-۲ روز)' }, { value: 'moderate', label: 'متوسط (۳-۴ روز)' }, { value: 'heavy', label: 'سنگین (۵+ روز)' }] },
  { id: 'nutrition', label: 'توضیح مختصر درباره رژیم غذایی فعلی:', type: 'textarea', placeholder: 'مثلاً: صبحانه کامل می‌خورم، ناهار برنج و مرغ، شام سبک. گاهی فست فود.' },
];

const StepIndicator = ({ icon: Icon, title, isActive }: { icon: React.ElementType, title: string, isActive: boolean }) => (
    <div className="flex flex-col items-center flex-1">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${isActive ? 'bg-cyan-500/20 border-cyan-500' : 'bg-gray-700 border-gray-600'}`}>
        <Icon className={`h-5 w-5 ${isActive ? 'text-cyan-400' : 'text-gray-500'}`} />
      </div>
      <p className={`mt-2 text-xs text-center font-semibold ${isActive ? 'text-white' : 'text-gray-500'}`}>{title}</p>
    </div>
);

const GuideStep = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
  <div className="flex items-start gap-4">
    <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center bg-gray-700 border-2 border-gray-600">
      <Icon className="h-6 w-6 text-cyan-400" />
    </div>
    <div className="text-right">
      <h3 className="font-bold text-white text-md">{title}</h3>
      <p className="text-sm text-gray-400 mt-1 leading-relaxed">{description}</p>
    </div>
  </div>
);


const FormulaFitQuiz: React.FC<FormulaFitQuizProps> = ({ onSubmit, isLoading, error }) => {
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizData, setQuizData] = useState<QuizData>({
    gender: '', age: '', weight: '', exerciseLevel: '',
    nutrition: '', sleep: '', goal: ''
  });
  const [currentStep, setCurrentStep] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setQuizData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(quizData);
  };
  
  const currentQuestion = questions[currentStep];
  const isCurrentFieldValid = quizData[currentQuestion.id as keyof QuizData].toString().trim() !== '';

  const inputClasses = "w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow text-white placeholder-gray-400 text-right";
  const labelClasses = "block text-lg font-bold text-gray-200 mb-4 text-right";
  
  const progressPercentage = (currentStep + 1) / questions.length * 100;

  if (!quizStarted) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in py-8">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-500 animate-gradient-text tracking-tight">
               به اکوسیستم فیت پرو خوش آمدید
            </h1>
            <p className="mt-4 text-lg text-gray-300 font-medium">اولین سامانه هوشمند طراحی مکمل اختصاصی در ایران</p>
        </div>
        <Card className="border-gray-800 border-2">
            <h2 className="text-xl font-bold mb-8 text-center text-white border-b border-gray-800 pb-4">مسیر شما در فیت پرو</h2>
            <div className="space-y-8">
                <GuideStep icon={PencilSquareIcon} title="۱. آنالیز بیولوژیک" description="پاسخ به سوالات کلیدی برای شناخت دقیق متابولیسم و فیزیولوژی شما." />
                <GuideStep icon={BeakerIcon} title="۲. پردازش ساسکا" description="هوش مصنوعی ساسکا (SASKA) فرمول مولکولی مکمل‌های مورد نیاز شما را محاسبه می‌کند." />
                <GuideStep icon={ShieldCheckIcon} title="۳. تایید متخصص" description="فرمول نهایی توسط تیم متخصصین تغذیه و فیزیولوژی بازبینی و تایید می‌شود." />
                <GuideStep icon={DocumentCheckIcon} title="۴. دریافت مکمل" description="ارسال پک مکمل اختصاصی با دوزبندی دقیق درب منزل شما." />
            </div>
            <div className="mt-8 pt-6 border-t border-gray-800">
                <button 
                    onClick={() => setQuizStarted(true)}
                    className="w-full bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-black py-4 px-6 rounded-xl transition-all duration-300 shadow-lg flex justify-center items-center text-lg hover:shadow-cyan-500/20">
                    شروع آنالیز رایگان
                </button>
            </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in py-8">
        <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">
              آنالیز تخصصی بدن
            </h1>
            <p className="text-gray-400 text-xs">لطفاً با دقت به سوالات پاسخ دهید</p>
        </div>

        <div className="flex justify-center items-start mb-10 relative px-4" dir="ltr">
             <div className="absolute top-5 left-4 right-4 h-0.5 bg-gray-800 z-0"></div>
             <div className="absolute top-5 left-4 h-0.5 bg-cyan-500 z-0 transition-all duration-500" style={{ width: `${isLoading ? 100 : (currentStep / (questions.length - 1)) * 100}%` }}></div>
             
             {/* Note: In LTR div, items are reversed visually compared to RTL logic if not careful, but flex row works. */}
             <StepIndicator icon={PencilSquareIcon} title="اطلاعات" isActive={true} />
             <StepIndicator icon={BeakerIcon} title="تحلیل" isActive={isLoading} />
             <StepIndicator icon={DocumentCheckIcon} title="نتیجه" isActive={false} />
        </div>

      <Card className="border-gray-800 border-2">
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="w-full bg-gray-800 rounded-full h-2 mb-6">
                <div className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-2 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]" style={{ width: `${progressPercentage}%` }}></div>
            </div>

            <div className="min-h-[220px] flex flex-col justify-center">
                <div className="animate-fade-in space-y-4">
                  <label htmlFor={currentQuestion.id} className={labelClasses}>
                    {currentQuestion.label}
                  </label>
                  {currentQuestion.type === 'select' && (
                    <select id={currentQuestion.id} name={currentQuestion.id} value={quizData[currentQuestion.id as keyof QuizData]} onChange={handleChange} className={inputClasses} required>
                      <option value="">لطفاً انتخاب کنید...</option>
                      {currentQuestion.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  )}
                  {currentQuestion.type === 'number' && (
                     <input type="number" id={currentQuestion.id} name={currentQuestion.id} value={quizData[currentQuestion.id as keyof QuizData]} onChange={handleChange} className={inputClasses} placeholder={currentQuestion.placeholder} required dir="ltr" />
                  )}
                  {currentQuestion.type === 'textarea' && (
                     <textarea id={currentQuestion.id} name={currentQuestion.id} value={quizData[currentQuestion.id as keyof QuizData]} onChange={handleChange} className={inputClasses} rows={4} placeholder={currentQuestion.placeholder} required></textarea>
                  )}
                </div>
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-gray-800">
              <button type="button" onClick={handleBack} disabled={currentStep === 0 || isLoading} className="text-gray-400 font-bold py-3 px-6 rounded-xl hover:bg-gray-800 disabled:opacity-30 transition-colors">
                مرحله قبل
              </button>
              
              {currentStep < questions.length - 1 ? (
                <button type="button" onClick={handleNext} disabled={!isCurrentFieldValid} className="bg-white text-black font-black py-3 px-8 rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg">
                  مرحله بعد
                </button>
              ) : (
                <button type="submit" disabled={isLoading || !isCurrentFieldValid} className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-black py-3 px-8 rounded-xl transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center min-w-[160px]">
                    {isLoading ? <LoadingSpinner /> : 'پردازش نهایی'}
                </button>
              )}
            </div>
             {error && <FormattedError message={error} />}
        </form>
      </Card>
    </div>
  );
};

export default FormulaFitQuiz;
