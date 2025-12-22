
import { PaymentRequest, User, PaymentStatus } from '../types';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const submitPayment = async (user: User, txId: string, receiptBase64?: string): Promise<PaymentRequest> => {
    const res = await fetch(`${API_URL}/subscription/submit`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ userId: user.id, txId, receiptUrl: receiptBase64 })
    });

    if(!res.ok) throw new Error('خطا در ثبت پرداخت');
    return res.json();
};

export const getUserPaymentStatus = (userId: string): PaymentStatus | null => {
    // In real app, we would fetch this. For now, we assume if role is premium, it's approved.
    const user = localStorage.getItem('user');
    if(user) {
        const parsed = JSON.parse(user);
        if(parsed.role === 'premium') return 'approved';
    }
    return null;
};

// Admin functions
export const getAllPayments = () => { return []; } 

export const getPendingPayments = async (): Promise<PaymentRequest[]> => { 
    try {
        // Admin token is usually stored separately or same token with admin role
        const res = await fetch(`${API_URL}/subscription/pending`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('adminToken') || localStorage.getItem('token')}`
            }
        });
        if(res.ok) return res.json();
        return [];
    } catch {
        return [];
    }
}

export const approvePayment = async (id: string) => {
    await fetch(`${API_URL}/subscription/${id}/approve`, { 
        method: 'PATCH', 
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
    });
};

export const rejectPayment = async (id: string) => {
    await fetch(`${API_URL}/subscription/${id}/reject`, { 
        method: 'PATCH', 
        headers: {
             'Content-Type': 'application/json',
             'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
    });
};
