import React from 'react';
import { Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../routes/routePaths';

export const FloatingSettingsButton: React.FC = () => {
  return (
    <Link
      to={ROUTES.SETTINGS}
      className="fixed bottom-6 right-6 w-11 h-11 rounded-full bg-[#299cdb] hover:bg-[#2283b8] text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-95 z-40 cursor-pointer shadow-none ring-4 ring-[#299cdb]/20"
      aria-label="Admin Settings & Customization"
      title="Console Settings"
    >
      <Settings className="w-5 h-5 animate-spin [animation-duration:8s]" />
    </Link>
  );
};

export default FloatingSettingsButton;
