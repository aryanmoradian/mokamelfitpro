
import { User, PaymentRequest } from '../types';

const API_URL = process.env.REACT_APP_API_URL || '/api';

export const adminLogin = async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    if (!res.ok) throw new Error('اطلاعات ورود اشتباه است.');
    
    const data = await res.json();
    if (data.user.role !== 'admin') throw new Error('شما دسترسی ادمین ندارید.');

    return { token: data.access_token, user: data.user };
};

export const verifyToken = (token: string): boolean => {
    // Simple client-side check. Real verification happens on API call failure (401).
    if (!token) return false;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 > Date.now() && payload.role === 'admin';
    } catch {
        return false;
    }
};

export const getPendingPayments = async (token: string): Promise<PaymentRequest[]> => {
    const res = await fetch(`${API_URL}/subscription/pending`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch payments');
    return res.json();
};

export const approvePayment = async (paymentId: string, token: string) => {
    const res = await fetch(`${API_URL}/subscription/${paymentId}/approve`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to approve');
    return res.json();
};

export const rejectPayment = async (paymentId: string, token: string) => {
    const res = await fetch(`${API_URL}/subscription/${paymentId}/reject`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to reject');
    return res.json();
};
