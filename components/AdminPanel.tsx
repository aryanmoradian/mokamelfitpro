
import React, { useState, useEffect } from 'react';
import AdminLogin from './Admin/AdminLogin';
import SubscriptionAdmin from './Admin/SubscriptionAdmin';
import AdminLayout from './Admin/AdminLayout';
import { verifyToken } from '../api/admin';

const AdminPanel: React.FC = () => {
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const token = localStorage.getItem('adminToken');
    if (token && verifyToken(token)) {
      setAdminToken(token);
    } else {
        localStorage.removeItem('adminToken');
    }
    setIsChecking(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setAdminToken(null);
  };

  if (isChecking) {
      return <div className="min-h-[50vh] flex items-center justify-center"><div className="animate-spin h-8 w-8 border-2 border-[#F5C542] rounded-full border-t-transparent"></div></div>;
  }

  // Auth Flow: If no valid token, show Login
  if (!adminToken) {
    return <AdminLogin onLogin={setAdminToken} />;
  }

  // Dashboard Flow: If token exists, show Layout + Content
  return (
    <AdminLayout onLogout={handleLogout}>
      <SubscriptionAdmin adminToken={adminToken} />
    </AdminLayout>
  );
};

export default AdminPanel;
