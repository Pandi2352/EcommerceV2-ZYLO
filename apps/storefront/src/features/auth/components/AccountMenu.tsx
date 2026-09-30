import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '@shared/auth/AuthContext';
import { ROUTES } from '../../../routes/routePaths';

/** Navbar account entry: "Sign in" when signed out, a small menu when signed in. */
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

  if (!user) {
    return (
      <Link to={ROUTES.CUSTOMER.LOGIN} className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors cursor-pointer">
        <User className="w-4 h-4 text-slate-600" />
        <span className="hidden sm:inline">Sign in</span>
      </Link>
    );
  }

  const signOut = async () => {
    setOpen(false);
    await logout();
    navigate(ROUTES.CUSTOMER.HOME);
  };

  const itemClass = 'w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer';

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors cursor-pointer"
      >
        <User className="w-4 h-4 text-slate-600" />
        <span className="hidden sm:inline max-w-[8rem] truncate">{user.name.split(' ')[0]}</span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-md py-1 z-50">
          <div className="px-3 py-2 border-b border-slate-100">
            <p className="text-xs font-bold text-slate-800 truncate">{user.name}</p>
            <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
          </div>
          <Link role="menuitem" to={ROUTES.CUSTOMER.SECURITY} className={itemClass} onClick={() => setOpen(false)}>
            <ShieldCheck className="w-3.5 h-3.5" /> Account security
          </Link>
          <button role="menuitem" type="button" onClick={signOut} className={`${itemClass} text-rose-600`}>
            <LogOut className="w-3.5 h-3.5" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
};

export default AccountMenu;
