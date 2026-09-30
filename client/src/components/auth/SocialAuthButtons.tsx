import React from 'react';
import { Button } from '../common/Button';

export const SocialAuthButtons: React.FC = () => {
  return (
    <div className="w-full flex flex-col items-center">
      <h3 className="text-base font-semibold text-slate-700 mb-5">
        Use Social Network Account
      </h3>

      <div className="w-full max-w-sm space-y-3">
        {/* Google */}
        <Button
          variant="social"
          size="md"
          fullWidth
          className="justify-center border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 py-3"
          onClick={() => {
            // Future OAuth integration
            console.log('Google Auth clicked');
          }}
        >
          <div className="flex items-center gap-2">
            <span>Sign up with</span>
            <div className="flex items-center font-bold">
              <span className="text-[#4285F4]">G</span>
              <span className="text-[#EA4335]">o</span>
              <span className="text-[#FBBC05]">o</span>
              <span className="text-[#4285F4]">g</span>
              <span className="text-[#34A853]">l</span>
              <span className="text-[#EA4335]">e</span>
            </div>
          </div>
        </Button>

        {/* Facebook */}
        <Button
          variant="social"
          size="md"
          fullWidth
          className="justify-center border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 py-3"
          onClick={() => {
            console.log('Facebook Auth clicked');
          }}
        >
          <div className="flex items-center gap-1.5">
            <span>Sign up with</span>
            <span className="font-bold text-[#1877F2]">Facebook</span>
          </div>
        </Button>

        {/* Amazon */}
        <Button
          variant="social"
          size="md"
          fullWidth
          className="justify-center border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 py-3"
          onClick={() => {
            console.log('Amazon Auth clicked');
          }}
        >
          <div className="flex items-center gap-1.5">
            <span>Sign up with</span>
            <span className="font-bold text-slate-900 tracking-tight">amazon</span>
          </div>
        </Button>
      </div>

      {/* Business Account Link */}
      <p className="mt-8 text-xs text-slate-500 text-center">
        Buying for work?{' '}
        <a
          href="#business"
          className="text-cyan-600 hover:text-cyan-700 font-medium hover:underline transition-colors"
        >
          Create a free business account
        </a>
      </p>
    </div>
  );
};

export default SocialAuthButtons;
