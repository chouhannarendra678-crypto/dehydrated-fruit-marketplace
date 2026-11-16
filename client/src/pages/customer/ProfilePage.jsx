import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { User, Mail, Phone, Calendar, ShieldCheck, LogOut } from 'lucide-react';
import { selectCurrentUser, logout } from '../../redux/slices/authSlice';
import Button from '../../components/common/Button';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-2">
      <div className="pb-4 border-b border-forest/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-forest">Customer Account Profile</h1>
          <p className="text-xs text-ink-muted mt-1">
            Manage your personal credentials, contact info, and security.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleLogout} className="text-tomato border-tomato/30 hover:bg-tomato/10">
          <LogOut className="w-4 h-4 mr-1.5" />
          Sign Out
        </Button>
      </div>

      <div className="bg-oat-card rounded-lg p-6 tablet:p-8 border border-forest/15 shadow-2xs space-y-6">
        {/* User Identity Header */}
        <div className="flex items-center gap-4 pb-6 border-b border-forest/15">
          <div className="w-16 h-16 rounded-md bg-forest text-oat flex items-center justify-center font-bold text-2xl font-display shadow-2xs">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h2 className="text-lg font-bold font-display text-forest">{user?.name || 'Verified User'}</h2>
            <p className="text-xs text-ink-muted">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-forest/10 text-forest border border-forest/20">
                {user?.role || 'CUSTOMER'}
              </span>
              {user?.isEmailVerified ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-forest bg-forest/10 px-2 py-0.5 rounded-md border border-forest/20">
                  <ShieldCheck className="w-3 h-3" /> Email Verified
                </span>
              ) : (
                <span className="text-[10px] font-medium text-[#C88E2D] bg-[#C88E2D]/10 px-2 py-0.5 rounded-md border border-[#C88E2D]/20">
                  Verification Pending
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Profile Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
          <div className="p-4 rounded-md bg-oat/60 border border-forest/15 space-y-1">
            <span className="text-ink-muted flex items-center gap-1.5 font-medium">
              <User className="w-3.5 h-3.5 text-forest" /> Full Name
            </span>
            <p className="text-sm font-bold text-forest">{user?.name || 'N/A'}</p>
          </div>

          <div className="p-4 rounded-md bg-oat/60 border border-forest/15 space-y-1">
            <span className="text-ink-muted flex items-center gap-1.5 font-medium">
              <Mail className="w-3.5 h-3.5 text-forest" /> Email Address
            </span>
            <p className="text-sm font-bold text-forest">{user?.email || 'N/A'}</p>
          </div>

          <div className="p-4 rounded-md bg-oat/60 border border-forest/15 space-y-1">
            <span className="text-ink-muted flex items-center gap-1.5 font-medium">
              <Phone className="w-3.5 h-3.5 text-forest" /> Contact Phone
            </span>
            <p className="text-sm font-bold text-forest">{user?.phone || 'Not provided'}</p>
          </div>

          <div className="p-4 rounded-md bg-oat/60 border border-forest/15 space-y-1">
            <span className="text-ink-muted flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-forest" /> Member Since
            </span>
            <p className="text-sm font-bold text-forest">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active Member'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
