import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, ShieldCheck, User, MapPin } from 'lucide-react';
import { useAuth } from '@shared/auth/AuthContext';
import { ROUTES } from '../../../routes/routePaths';
import { toast } from '@shared/ui/Toast';

export const AccountMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const signOut = async () => {
    setOpen(false);
    await logout();
    toast.info('You have been signed out.');
    navigate(ROUTES.CUSTOMER.HOME);
  };

  const itemClass = 'w-full flex items-center gap-2 px-3 py-2 text-[13px] text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors';

  // Solid user silhouette icon matching the uploaded screenshot
  const UserIcon = (
    <svg className="w-5 h-5 text-slate-600 shrink-0" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="7" r="4.5" />
      <path d="M4 20a8 8 0 0 1 16 0H4z" />
    </svg>
  );

  if (!user) {
    return (
      <Link
        to={ROUTES.CUSTOMER.LOGIN}
        className="flex items-center gap-1.5 hover:text-amber-600 transition-colors cursor-pointer text-slate-700 text-[13.5px] font-medium"
      >
        {UserIcon}
        <span className="hidden sm:inline">Account</span>
      </Link>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-1.5 hover:text-amber-600 transition-colors cursor-pointer text-slate-700 text-[13.5px] font-medium"
      >
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt="" className="w-5 h-5 rounded-full object-cover shrink-0" />
        ) : (
          UserIcon
        )}
        <span className="hidden sm:inline max-w-[8rem] truncate font-semibold">{user.name.split(' ')[0]}</span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-md py-1 z-50 shadow-none">
          <div className="px-3 py-2 border-b border-slate-100">
            <p className="text-xs font-bold text-slate-800 truncate">{user.name}</p>
            <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
          </div>
          <Link role="menuitem" to={ROUTES.CUSTOMER.PROFILE} className={itemClass} onClick={() => setOpen(false)}>
            <User className="w-3.5 h-3.5 text-slate-400" /> My Profile
          </Link>
          <Link role="menuitem" to={ROUTES.CUSTOMER.ADDRESSES} className={itemClass} onClick={() => setOpen(false)}>
            <MapPin className="w-3.5 h-3.5 text-slate-400" /> Saved Addresses
          </Link>
          <Link role="menuitem" to={ROUTES.CUSTOMER.SECURITY} className={itemClass} onClick={() => setOpen(false)}>
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" /> Account Security
          </Link>
          <div className="border-t border-slate-100 my-1"></div>
          <button role="menuitem" type="button" onClick={signOut} className={`${itemClass} text-rose-600 hover:bg-rose-50`}>
            <LogOut className="w-3.5 h-3.5" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
};

export default AccountMenu;
