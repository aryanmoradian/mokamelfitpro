
import React, { useState, useCallback, useRef } from 'react';
import Card from './shared/Card';
import { analyzeImageAndRegenerateFormula } from '../services/geminiService';
import { fileToBase64 } from '../utils/fileUtils';
import LoadingSpinner from './shared/LoadingSpinner';
import { PhotoIcon, SparklesIcon, DocumentMagnifyingGlassIcon, XMarkIcon, LockClosedIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';
import { AnalysisResult, User } from '../types';
import PremiumModal from './PremiumModal';
import { logUserEvent } from '../services/eventService';
import * as authService from '../utils/authService';

interface ImageToolsProps {
  onUpdateAnalysis?: (newAnalysis: AnalysisResult) => void;
  currentAnalysis?: AnalysisResult;
  user?: User | null;
}

const ImageTools: React.FC<ImageToolsProps> = ({ onUpdateAnalysis, currentAnalysis, user }) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visionResult, setVisionResult] = useState<any>(null); // For displaying initial detection
  const [isDragging, setIsDragging] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Paywall Check
  const isPremium = user?.role === 'premium' || user?.role === 'admin';

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
      setSuccessMessage(null);
      setVisionResult(null);
    }
  };

  const handleRemoveImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedImage(null);
    setPreviewUrl(null);
    setVisionResult(null);
    setSuccessMessage(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;
    if (!isPremium) {
        setShowPremiumModal(true);
        return;
    }
    if (!currentAnalysis || !onUpdateAnalysis) {
        setError("خطا در دسترسی به اطلاعات فرمول فعلی.");
        return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const base64Image = await fileToBase64(selectedImage);
      
      // Call the new Service: Vision -> SASKA -> Update
      const updatedAnalysis = await analyzeImageAndRegenerateFormula(
          currentAnalysis,
          base64Image,
          selectedImage.type
      );

      setVisionResult(updatedAnalysis.visionAnalysis);
      onUpdateAnalysis(updatedAnalysis);
      setSuccessMessage("فرمول شما با موفقیت بر اساس تصویر به‌روزرسانی شد!");
      
      if (user) {
         logUserEvent(user.id, 'AI_USED', 'ai', { type: 'vision_formula_update' });
      }

    } catch (err: any) {
      console.error("Vision AI error:", err);
      setError("متاسفم، مشکلی در تحلیل تصویر پیش آمد. لطفاً تصویر واضح‌تری امتحان کنید.");
    } finally {
      setIsLoading(false);
    }
  };

  const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
       const file = event.dataTransfer.files[0];
       if (file.type.startsWith('image/')) {
           setSelectedImage(file);
           setPreviewUrl(URL.createObjectURL(file));
       }
    }
  }, []);

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };
  
  const onDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(true);
  };
  
  const onDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);
  };

  const handleUpgradeSuccess = async () => {
      if (user) {
          await authService.upgradeToPremium(user.id);
          setShowPremiumModal(false);
          // Force re-render or state update handled by parent usually, 
          // but for instant feedback we might need a refresh logic. 
          // For now, rely on parent re-rendering Dashboard.
      }
  };

  return (
    <Card className="animate-fade-in relative overflow-hidden">
        {showPremiumModal && (
            <PremiumModal onUpgrade={handleUpgradeSuccess} onClose={() => setShowPremiumModal(false)} />
        )}
        
        {/* Background Decorative */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

        <div className="text-center mb-6 relative z-10">
            <h2 className="text-2xl font-brand font-black text-white uppercase tracking-tighter flex items-center justify-center gap-2">
                <DocumentMagnifyingGlassIcon className="h-6 w-6 text-cyan-400" />
                اسکنر هوشمند <span className="text-[#F5C542]">تصویری</span>
            </h2>
            <p className="text-xs text-gray-400 mt-2 max-w-md mx-auto">
                از مکمل یا وعده غذایی خود عکس بگیرید. ساسکا آن را تحلیل کرده و فرمول شما را به‌روزرسانی می‌کند.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            
            {/* Upload Area */}
            <div>
                {!isPremium && (
                    <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between">
                         <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                            <LockClosedIcon className="h-4 w-4" />
                            <span>قابلیت ویژه کاربران Premium</span>
                         </div>
                         <button onClick={() => setShowPremiumModal(true)} className="text-[10px] bg-amber-500 text-black px-2 py-1 rounded font-black hover:bg-amber-400 transition-colors">
                            ارتقا دهید
                         </button>
                    </div>
                )}

                <div className="relative">
                    {previewUrl ? (
                        <div className="relative group rounded-xl overflow-hidden border border-gray-700 bg-black/50 aspect-video">
                            <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                            <button
                                onClick={handleRemoveImage}
                                className="absolute top-2 right-2 p-1.5 bg-black/70 rounded-full text-white hover:bg-red-500 transition-colors"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>
                    ) : (
                        <div 
                            onDrop={onDrop} 
                            onDragOver={onDragOver}
                            onDragEnter={onDragEnter}
                            onDragLeave={onDragLeave}
                            className={`border-2 border-dashed rounded-xl aspect-video flex flex-col items-center justify-center transition-all ${isDragging ? 'border-cyan-500 bg-cyan-500/10' : 'border-gray-700 hover:border-cyan-500/50 hover:bg-gray-800'}`}
                        >
                            <PhotoIcon className={`h-12 w-12 mb-3 ${isDragging ? 'text-cyan-400' : 'text-gray-600'}`} />
                            <label className="cursor-pointer text-center">
                                <span className="text-sm font-bold text-gray-300 block mb-1">
                                    عکس را اینجا بکشید یا کلیک کنید
                                </span>
                                <span className="text-[10px] text-gray-500 block">PNG, JPG پشتیبانی می‌شود</span>
                                <input 
                                    ref={fileInputRef} 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*" 
                                    onChange={handleImageChange}
                                    disabled={!isPremium}
                                />
                            </label>
                        </div>
                    )}
                </div>

                <button 
                    onClick={handleAnalyze} 
                    disabled={isLoading || !selectedImage} 
                    className={`mt-4 w-full font-black py-3 rounded-xl transition-all shadow-lg flex justify-center items-center gap-2 uppercase tracking-widest ${isLoading || !selectedImage ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white hover:scale-[1.02]'}`}
                >
                    {isLoading ? <LoadingSpinner /> : (
                        <>
                            <SparklesIcon className="h-5 w-5" />
                            تحلیل و آپدیت فرمول
                        </>
                    )}
                </button>

                {error && (
                    <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs text-center">
                        {error}
                    </div>
                )}
                 {successMessage && (
                    <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-xs text-center flex items-center justify-center gap-2 animate-fade-in">
                        <CheckBadgeIcon className="h-4 w-4" />
                        {successMessage}
                    </div>
                )}
            </div>

            {/* Results Area */}
            <div className="h-full min-h-[300px] bg-black/40 border border-gray-800 rounded-xl p-6 relative">
                 <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-cyan-500/0 via-cyan-500/50 to-cyan-500/0"></div>
                 
                 {!visionResult ? (
                     <div className="h-full flex flex-col items-center justify-center text-gray-600 text-center opacity-60">
                         <DocumentMagnifyingGlassIcon className="h-12 w-12 mb-3" />
                         <p className="text-sm font-bold">هنوز تحلیلی انجام نشده است</p>
                         <p className="text-xs">پس از آپلود، ساسکا جزئیات را اینجا نمایش می‌دهد.</p>
                     </div>
                 ) : (
                     <div className="animate-fade-in space-y-4">
                         <div className="flex items-center justify-between border-b border-gray-700 pb-3">
                             <h3 className="font-bold text-white text-lg">نتیجه تحلیل</h3>
                             <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${visionResult.type === 'supplement' ? 'bg-purple-500/20 text-purple-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                 {visionResult.type === 'supplement' ? 'مکمل شناسایی شد' : visionResult.type === 'food' ? 'غذا شناسایی شد' : 'ناشناخته'}
                             </span>
                         </div>
                         
                         <div className="space-y-3">
                             <div>
                                 <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">آیتم شناسایی شده</p>
                                 <p className="text-xl font-black text-cyan-400">{visionResult.name}</p>
                             </div>
                             
                             {visionResult.type === 'supplement' && (
                                 <div>
                                     <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">تخمین دوز / مقدار</p>
                                     <p className="text-base text-gray-200">{visionResult.doseEstimate || 'نامشخص'}</p>
                                 </div>
                             )}

                             {visionResult.type === 'food' && (
                                 <div className="grid grid-cols-2 gap-4">
                                     <div className="bg-gray-800 p-2 rounded-lg text-center">
                                         <p className="text-[9px] text-gray-500 uppercase">کالری تقریبی</p>
                                         <p className="font-bold text-white">{visionResult.calories} kcal</p>
                                     </div>
                                      <div className="bg-gray-800 p-2 rounded-lg text-center">
                                         <p className="text-[9px] text-gray-500 uppercase">پروتئین</p>
                                         <p className="font-bold text-white">{visionResult.protein} g</p>
                                     </div>
                                 </div>
                             )}
                             
                             <div className="mt-4 pt-4 border-t border-gray-700">
                                 <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">تغییرات اعمال شده در فرمول</p>
                                 <div className="bg-cyan-500/10 border border-cyan-500/20 p-3 rounded-lg text-xs text-cyan-200">
                                     فرمول شما با موفقیت با داده‌های جدید همگام‌سازی شد. بخش "Stack" و "Alerts" در داشبورد بروز شده‌اند.
                                 </div>
                             </div>
                         </div>
                     </div>
                 )}
            </div>
        </div>
    </Card>
  );
};

export default ImageTools;
