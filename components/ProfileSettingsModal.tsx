
import React, { useState, useRef } from 'react';
import { User } from '../types';
import { XMarkIcon, PhotoIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { fileToBase64 } from '../utils/fileUtils';

interface ProfileSettingsModalProps {
    user: User;
    onSave: (updatedUser: User) => void;
    onClose: () => void;
}

const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({ user, onSave, onClose }) => {
    const [displayName, setDisplayName] = useState(user.displayName || '');
    const [profilePicture, setProfilePicture] = useState(user.profilePicture || '');
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            try {
                const base64 = await fileToBase64(file);
                const fullBase64 = `data:${file.type};base64,${base64}`;
                setProfilePicture(fullBase64);
            } catch (error) {
                console.error("Failed to convert image", error);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate save delay
        await new Promise(resolve => setTimeout(resolve, 500));
        onSave({ ...user, displayName, profilePicture });
        setIsLoading(false);
        onClose();
    };

    const removePicture = () => {
        setProfilePicture('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300 animate-fade-in"
            onClick={onClose}
        >
            <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 border border-gray-700 shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-cyan-400">ویرایش پروفایل</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-white">
                        <XMarkIcon className="h-6 w-6"/>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex flex-col items-center">
                        <div className="relative group w-24 h-24 mb-4">
                            {profilePicture ? (
                                <img 
                                    src={profilePicture} 
                                    alt="Profile" 
                                    className="w-full h-full rounded-full object-cover border-2 border-cyan-500"
                                />
                            ) : (
                                <div className="w-full h-full rounded-full bg-gray-700 flex items-center justify-center border-2 border-gray-600">
                                    <PhotoIcon className="h-10 w-10 text-gray-400" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <ArrowPathIcon className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            accept="image/*" 
                            className="hidden" 
                        />
                        <div className="flex gap-3 text-sm">
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="text-cyan-400 hover:underline">تغییر تصویر</button>
                            {profilePicture && <button type="button" onClick={removePicture} className="text-red-400 hover:underline">حذف</button>}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="displayName" className="block text-sm font-medium text-gray-300 mb-2">نام نمایشی</label>
                        <input 
                            type="text" 
                            id="displayName"
                            value={displayName}
                            onChange={e => setDisplayName(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            placeholder="نام خود را وارد کنید"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">ایمیل (غیرقابل تغییر)</label>
                        <div className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-4 py-2 text-gray-400 cursor-not-allowed">
                            {user.email}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                         <button 
                            type="button"
                            onClick={onClose} 
                            className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                        >
                            انصراف
                        </button>
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="bg-gradient-to-r from-cyan-500 to-emerald-600 hover:from-cyan-600 hover:to-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition-all disabled:opacity-50"
                        >
                            {isLoading ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileSettingsModal;