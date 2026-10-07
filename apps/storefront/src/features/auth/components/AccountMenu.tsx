import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, LogOut, ShieldCheck, User, MapPin } from 'lucide-react';
import { useAuth } from '@shared/auth/AuthContext';
import { ROUTES } from '../../../routes/routePaths';
import { toast } from '@shared/ui/Toast';

export const AccountMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isAccountActive =
    location.pathname.startsWith('/account') ||
    location.pathname === ROUTES.CUSTOMER.LOGIN ||
    location.pathname === ROUTES.CUSTOMER.REGISTER;

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

  const getItemClass = (path: string) => {
    const active = location.pathname === path;
    return `w-full flex items-center gap-2 px-3 py-2 text-[13px] transition-colors cursor-pointer ${
      active
        ? 'bg-amber-50 text-amber-900 font-bold'
        : 'text-slate-700 hover:bg-slate-50'
    }`;
  };

  // Solid user silhouette icon matching the uploaded screenshot
  const UserIcon = (
    <svg
      className={`w-5 h-5 shrink-0 transition-colors ${
        isAccountActive ? 'text-amber-600 fill-amber-600' : 'text-slate-600'
      }`}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <circle cx="12" cy="7" r="4.5" />
      <path d="M4 20a8 8 0 0 1 16 0H4z" />
    </svg>
  );

  if (!user) {
    return (
      <Link
        to={ROUTES.CUSTOMER.LOGIN}
        className={`flex items-center gap-1.5 transition-colors cursor-pointer text-[13.5px] ${
          isAccountActive ? 'text-amber-600 font-bold' : 'text-slate-700 hover:text-amber-600 font-medium'
        }`}
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
        className={`flex items-center gap-1.5 transition-colors cursor-pointer text-[13.5px] ${
          isAccountActive ? 'text-amber-600 font-bold' : 'text-slate-700 hover:text-amber-600 font-medium'
        }`}
      >
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt=""
            className={`w-5 h-5 rounded-full object-cover shrink-0 ring-1 ${
              isAccountActive ? 'ring-amber-500' : 'ring-slate-200'
            }`}
          />
        ) : (
          UserIcon
        )}
        <span className="hidden sm:inline max-w-[8rem] truncate">{user.name.split(' ')[0]}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${
          open ? 'rotate-180 text-amber-600' : isAccountActive ? 'text-amber-600' : 'text-slate-400'
        }`} />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-md py-1 z-50 shadow-none animate-in fade-in duration-100">
          <div className="px-3 py-2 border-b border-slate-100">
            <p className="text-xs font-bold text-slate-800 truncate">{user.name}</p>
            <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
          </div>
          <Link role="menuitem" to={ROUTES.CUSTOMER.PROFILE} className={getItemClass(ROUTES.CUSTOMER.PROFILE)} onClick={() => setOpen(false)}>
            <User className="w-3.5 h-3.5 text-slate-400" /> My Profile
          </Link>
          <Link role="menuitem" to={ROUTES.CUSTOMER.ADDRESSES} className={getItemClass(ROUTES.CUSTOMER.ADDRESSES)} onClick={() => setOpen(false)}>
            <MapPin className="w-3.5 h-3.5 text-slate-400" /> Saved Addresses
          </Link>
          <Link role="menuitem" to={ROUTES.CUSTOMER.SECURITY} className={getItemClass(ROUTES.CUSTOMER.SECURITY)} onClick={() => setOpen(false)}>
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" /> Account Security
          </Link>
          <div className="border-t border-slate-100 my-1"></div>
          <button role="menuitem" type="button" onClick={signOut} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors">
            <LogOut className="w-3.5 h-3.5" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
};

export default AccountMenu;
