
import { User, UserStatus, AnalysisResult, WaterReminderSettings } from '../types';

// Points to Nginx Proxy (/api) which routes to Backend
const API_URL = process.env.REACT_APP_API_URL || '/api';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const signUp = async (email: string, password: string, firstName: string, lastName: string): Promise<User> => {
    const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, firstName, lastName })
    });
    
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'خطا در ثبت نام.');
    }
    const data = await res.json();
    
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data.user;
};

export const login = async (email: string, password: string): Promise<User> => {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'اطلاعات ورود اشتباه است.');
    }
    const data = await res.json();
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data.user;
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('adminToken');
};

export const getCurrentUser = (): User | null => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
        return JSON.parse(userStr);
    } catch {
        return null;
    }
};

export const resetPasswordRequest = async (email: string) => {
    // Mock implementation as endpoint missing in provided backend code
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
};

export const updateUserProfile = async (user: User): Promise<User> => {
    // In a real app, send PUT to /users/profile
    // For now, update local storage
    localStorage.setItem('user', JSON.stringify(user));
    return user;
};

// History management (LocalStorage for MVP)
export const saveUserHistory = (userId: string, history: AnalysisResult[]) => {
    localStorage.setItem(`history_${userId}`, JSON.stringify(history));
};

export const getUserHistory = (userId: string): AnalysisResult[] => {
    const h = localStorage.getItem(`history_${userId}`);
    return h ? JSON.parse(h) : [];
};

// Water Reminder (LocalStorage)
export const getWaterReminderSettings = (userId: string): WaterReminderSettings => {
    const s = localStorage.getItem(`water_${userId}`);
    return s ? JSON.parse(s) : { enabled: false, interval: 60, message: 'آب بنوشید!' };
};

export const saveWaterReminderSettings = (userId: string, settings: WaterReminderSettings) => {
    localStorage.setItem(`water_${userId}`, JSON.stringify(settings));
};

export const upgradeToPremium = async (userId: string) => {
    // In real flow, verify transaction then update. 
    // This helper might just refresh the local user data from backend
    const user = getCurrentUser();
    if(user && user.id === userId) {
        user.role = 'premium';
        localStorage.setItem('user', JSON.stringify(user));
    }
};

// Admin Helpers
export const getAllUsers = async (): Promise<User[]> => {
    // Mock data if backend endpoint missing in provided files
    // But typically this calls GET /users
    return []; 
};

export const updateStatus = async (userId: string, status: UserStatus) => {
     // Mock fetch
};
