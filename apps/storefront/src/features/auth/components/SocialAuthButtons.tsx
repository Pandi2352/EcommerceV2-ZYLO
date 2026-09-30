import React from 'react';
import { authService } from '../../../services/auth.service';

export interface SocialAuthButtonsProps {
  mode: 'signin' | 'signup';
  /** Path to return to after sign-in */
  redirect: string;
  remember?: boolean;
}

const GoogleWordmark = () => (
  <span className="flex items-center font-bold">
    <span className="text-[#4285F4]">G</span>
    <span className="text-[#EA4335]">o</span>
    <span className="text-[#FBBC05]">o</span>
    <span className="text-[#4285F4]">g</span>
    <span className="text-[#34A853]">l</span>
    <span className="text-[#EA4335]">e</span>
  </span>
);

/**
 * Social sign-in options. Render only when a provider is enabled
 * (see useAuthProviders). Google sign-in is a full-page redirect.
 */
export const SocialAuthButtons: React.FC<SocialAuthButtonsProps> = ({ mode, redirect, remember = false }) => (
  <div className="w-full flex flex-col items-center">
    <h3 className="text-base font-semibold text-slate-700 mb-5">Or continue with</h3>
    <div className="w-full max-w-sm">
      <a
        href={authService.googleSignInUrl(redirect, remember)}
        className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 text-sm rounded-md bg-white border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer"
      >
        <span>{mode === 'signup' ? 'Sign up with' : 'Sign in with'}</span>
        <GoogleWordmark />
      </a>
    </div>
  </div>
);

export default SocialAuthButtons;
