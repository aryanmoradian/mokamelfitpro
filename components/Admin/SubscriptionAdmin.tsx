
import React, { useState, useEffect } from 'react';
import { User, UserEvent, UserStatus, PaymentRequest } from '../../types';
import Card from '../shared/Card';
import { 
  UsersIcon, 
  ShieldExclamationIcon, 
  QueueListIcon, 
  MagnifyingGlassIcon,
  NoSymbolIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  BanknotesIcon,
  XCircleIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import * as authService from '../../utils/authService';
import { getEvents } from '../../services/eventService';
import { getPendingPayments, approvePayment, rejectPayment } from '../../api/admin';
import LoadingSpinner from '../shared/LoadingSpinner';

interface SubscriptionAdminProps {
    adminToken: string;
}

const SubscriptionAdmin: React.FC<SubscriptionAdminProps> = ({ adminToken }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<UserEvent[]>([]);
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<UserStatus | 'all'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [processingPaymentId, setProcessingPaymentId] = useState<string | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
        const [fetchedUsers, fetchedEvents, fetchedPayments] = await Promise.all([
            authService.getAllUsers(), // Requires Admin API implementation in authService
            Promise.resolve(getEvents()), // Events are local for now in this MVP version
            getPendingPayments(adminToken)
        ]);
        
        setUsers(fetchedUsers);
        setEvents(fetchedEvents);
        setPayments(fetchedPayments);
    } catch (error) {
        console.error("Error loading admin data", error);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [adminToken]);

  const handleToggleStatus = async (userId: string, currentStatus: UserStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    await authService.updateStatus(userId, newStatus);
    loadData();
  };

  const handleApprovePayment = async (paymentId: string) => {
      setProcessingPaymentId(paymentId);
      try {
          await approvePayment(paymentId, adminToken);
          await loadData();
          alert('پرداخت تایید و کاربر ارتقا یافت.');
      } catch (e: any) {
          alert(e.message || 'خطا در تایید پرداخت');
      } finally {
          setProcessingPaymentId(null);
      }
  };

  const handleRejectPayment = async (paymentId: string) => {
      if(!window.confirm('آیا از رد کردن این پرداخت اطمینان دارید؟')) return;
      setProcessingPaymentId(paymentId);
      try {
          await rejectPayment(paymentId, adminToken);
          await loadData();
      } catch (e: any) {
          alert(e.message || 'خطا در رد پرداخت');
      } finally {
          setProcessingPaymentId(null);
      }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filter === 'all' || u.status === filter;
    return matchesSearch && matchesFilter;
  });

  const pendingPayments = payments;

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    suspended: users.filter(u => u.status === 'suspended').length,
    eventsCount: events.length,
    revenue: users.filter(u => u.role === 'premium').length // Simplified revenue calc
  };

  return (
    <div className="space-y-8 animate-fade-in relative">
      {viewingReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setViewingReceipt(null)}>
              <div className="relative max-w-2xl w-full bg-[#1A1A1A] rounded-2xl overflow-hidden border border-gray-700">
                  <img src={viewingReceipt} alt="Receipt" className="w-full h-auto max-h-[80vh] object-contain" />
                  <button className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-white hover:bg-red-500">
                      <XCircleIcon className="h-6 w-6" />
                  </button>
              </div>
          </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatCard title="کل کاربران" value={stats.total} icon={UsersIcon} color="text-cyan-400" />
        <StatCard title="کاربران فعال" value={stats.active} icon={CheckCircleIcon} color="text-emerald-400" />
        <StatCard title="مشترکین ویژه" value={stats.revenue} icon={BanknotesIcon} color="text-green-400" />
        <StatCard title="در انتظار تایید" value={pendingPayments.length} icon={QueueListIcon} color="text-amber-400" />
        <StatCard title="رویدادها" value={stats.eventsCount} icon={ShieldExclamationIcon} color="text-gray-400" />
      </div>

      <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-amber-500/0 via-amber-500 to-amber-500/0 animate-pulse"></div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-black text-amber-400 flex items-center gap-2">
                <BanknotesIcon className="h-6 w-6" />
                تراکنش‌های در انتظار تایید
            </h2>
            <button onClick={loadData} className="p-2 text-amber-400 hover:bg-amber-500/10 rounded-lg">
                <ArrowPathIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          {pendingPayments.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">هیچ تراکنش معلقی وجود ندارد.</p>
          ) : (
              <div className="overflow-x-auto">
                  <table className="w-full text-right text-sm text-gray-300">
                      <thead className="bg-amber-500/10 text-amber-200">
                          <tr>
                              <th className="p-3 rounded-r-lg">کاربر</th>
                              <th className="p-3">مبلغ</th>
                              <th className="p-3">TXID</th>
                              <th className="p-3">رسید</th>
                              <th className="p-3">تاریخ</th>
                              <th className="p-3 rounded-l-lg">عملیات</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-amber-500/10">
                          {pendingPayments.map(p => (
                              <tr key={p.id} className="hover:bg-amber-500/5 transition-colors">
                                  <td className="p-3 font-bold text-white">{(p as any).user?.email || p.userId}</td>
                                  <td className="p-3 font-mono text-green-400">{p.amount}</td>
                                  <td className="p-3 font-mono text-xs max-w-[100px] truncate select-all" title={p.txId}>{p.txId}</td>
                                  <td className="p-3">
                                      {p.receiptUrl ? (
                                          <button 
                                            onClick={() => setViewingReceipt(p.receiptUrl!)}
                                            className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 px-2 py-1 rounded-md"
                                          >
                                              <PhotoIcon className="h-4 w-4" />
                                              مشاهده
                                          </button>
                                      ) : (
                                          <span className="text-gray-600 text-xs italic">ندارد</span>
                                      )}
                                  </td>
                                  <td className="p-3 text-xs" dir="ltr">{new Date(p.createdAt).toLocaleDateString('fa-IR')}</td>
                                  <td className="p-3 flex gap-2">
                                      <button 
                                        onClick={() => handleApprovePayment(p.id)} 
                                        disabled={!!processingPaymentId}
                                        className="bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-lg shadow-green-900/20 disabled:opacity-50"
                                      >
                                          {processingPaymentId === p.id ? <LoadingSpinner /> : <CheckCircleIcon className="h-4 w-4" />}
                                          تایید
                                      </button>
                                      <button 
                                        onClick={() => handleRejectPayment(p.id)}
                                        disabled={!!processingPaymentId}
                                        className="bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-lg shadow-red-900/20 disabled:opacity-50"
                                      >
                                          <XCircleIcon className="h-4 w-4" />
                                          رد
                                      </button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="flex flex-col h-full border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <h2 className="text-xl font-black flex items-center gap-2 text-white">
                <UsersIcon className="h-6 w-6 text-cyan-400" />
                مدیریت کاربران
              </h2>
              <div className="relative w-full md:w-auto">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-2.5 text-gray-500" />
                  <input 
                    type="text" 
                    placeholder="جستجو..." 
                    className="bg-black/50 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm w-full focus:ring-1 focus:ring-cyan-500 outline-none transition-all text-right"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead className="text-gray-500 border-b border-gray-800 bg-gray-900/50">
                  <tr>
                    <th className="p-3 pr-2 rounded-tr-lg">کاربر</th>
                    <th className="p-3">نقش</th>
                    <th className="p-3">وضعیت</th>
                    <th className="p-3 text-left rounded-tl-lg">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-gray-800/30 transition-colors group">
                      <td className="py-4 pr-2">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">
                            {user.firstName?.[0] || user.email[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-200">{user.displayName || 'بدون نام'}</p>
                            <p className="text-[10px] text-gray-500 font-mono text-left" dir="ltr">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${user.role === 'admin' ? 'bg-amber-500/10 text-amber-400' : user.role === 'premium' ? 'bg-[#F5C542]/20 text-[#F5C542]' : 'bg-gray-800 text-gray-400'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${user.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                          {user.status === 'active' ? 'فعال' : 'تعلیق'}
                        </span>
                      </td>
                      <td className="py-4 text-left pl-2">
                        <button 
                            onClick={() => handleToggleStatus(user.id, user.status)}
                            className={`p-1.5 rounded-lg transition-colors ${user.status === 'active' ? 'hover:bg-red-500/10 text-gray-600 hover:text-red-400' : 'hover:bg-emerald-500/10 text-gray-600 hover:text-emerald-400'}`}
                        >
                            {user.status === 'active' ? <NoSymbolIcon className="h-5 w-5" /> : <CheckCircleIcon className="h-5 w-5" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div>
          <Card className="h-full border-gray-800 bg-[#151515]">
            <h2 className="text-xl font-black mb-6 flex items-center gap-2 border-b border-gray-800 pb-4 text-white">
              <ShieldExclamationIcon className="h-6 w-6 text-gray-400" />
              رویدادهای سیستم
            </h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {events.slice(0, 20).map(event => (
                <div key={event.id} className="p-3 bg-black/40 rounded-xl border border-gray-800 hover:border-gray-700 transition-all">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-black text-cyan-400 uppercase tracking-wider">{event.eventType}</span>
                    <span className="text-[10px] text-gray-600 font-mono" dir="ltr">{new Date(event.createdAt).toLocaleTimeString('fa-IR')}</span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    کاربر <span className="text-gray-300 font-mono">{event.userId.slice(0, 6)}...</span>
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <Card className="flex items-center gap-4 bg-[#1A1A1A] border-gray-800">
    <div className={`p-3 rounded-2xl bg-black border border-gray-800 ${color}`}>
      <Icon className="h-6 w-6" />
    </div>
    <div>
      <p className="text-xs text-gray-500 font-bold">{title}</p>
      <p className="text-2xl font-black text-white">{value}</p>
    </div>
  </Card>
);

export default SubscriptionAdmin;
