import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Shield, LogOut, Key } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="User Profile"
        subtitle="Manage your session, assigned roles and security credentials"
        breadcrumbs={[
          { label: 'Management', to: '/dashboard' },
          { label: 'Profile' },
        ]}
      />

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Profile Card Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-2xl font-bold text-white shadow-md">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold">{user?.name || 'Administrator'}</h2>
            <p className="text-sm text-slate-400">{user?.email || 'admin@stocksense.io'}</p>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-6 space-y-5">
          <div>
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Assigned Permissions & Authority
            </span>
            <div className="flex flex-wrap gap-2">
              {user?.roles?.map((role, idx) => (
                <Badge key={idx} label={role} variant="VALIDATED" />
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-3 text-xs text-slate-600">
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="font-medium text-slate-700">Account Type</span>
              <span>Enterprise Warehouse Operator</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="font-medium text-slate-700">Authentication Scheme</span>
              <span className="font-mono">Bearer JWT (jjwt)</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="font-medium text-slate-700">Password Reset</span>
              <span className="text-slate-400 italic">Self-service reset disabled by policy</span>
            </div>
          </div>

          <div className="pt-5 border-t border-slate-100 flex justify-end">
            <Button variant="danger" size="md" icon={LogOut} onClick={handleLogout}>
              Sign Out of Session
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
