import { Link } from 'react-router-dom';
import {
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  ShieldAlert,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ZyloLogo from '../../components/common/ZyloLogo';
import Button from '../../components/common/Button';

export default function AdminDashboardPage() {
  const { user, logout } = useAuth();

  const stats = [
    { title: 'Total Customers', value: '1,280', change: '+12.5%', icon: Users },
    { title: 'Catalog Products', value: '450', change: '+4.2%', icon: Package },
    { title: 'Fulfilled Orders', value: '3,892', change: '+18.1%', icon: ShoppingCart },
    { title: 'Gross Revenue', value: '$84,320', change: '+24.0%', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Admin Header */}
      <header className="bg-slate-850 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ZyloLogo variant="full" size="md" theme="dark" badge="ADMIN" />
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs font-bold text-white block">{user?.name || 'Administrator'}</span>
            <span className="text-[10px] text-slate-400 font-mono block">{user?.email}</span>
          </div>

          <Link to="/" target="_blank" className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
            <span>Customer Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => logout()}
            className="text-slate-300 hover:bg-slate-800 hover:text-rose-400"
            leftIcon={<LogOut className="w-4 h-4" />}
          >
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Admin Overview</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time platform operations and metrics
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Server Cluster Healthy</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={idx} className="bg-slate-800/80 border border-slate-700 rounded-md p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">{s.title}</span>
                  <Icon className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-white">{s.value}</span>
                  <span className="text-xs font-semibold text-emerald-400">{s.change}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Informational Callout */}
        <div className="bg-slate-800 border border-slate-700 rounded-md p-5 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 leading-relaxed">
            <span className="font-bold text-white">Strict Customer/Admin Isolation:</span> Registration is restricted strictly to the Customer storefront. Administrator accounts cannot be created via public sign-up and are managed through internal seed operations or Superadmin delegations.
          </div>
        </div>
      </main>
    </div>
  );
}
