import {
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  ShieldCheck,
  ArrowUpRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboardPage() {
  const { user } = useAuth();

  const stats = [
    { title: 'Total Customers', value: '1,280', change: '+12.5%', icon: Users },
    { title: 'Catalog Products', value: '450', change: '+4.2%', icon: Package },
    { title: 'Fulfilled Orders', value: '3,892', change: '+18.1%', icon: ShoppingCart },
    { title: 'Gross Revenue', value: '$84,320', change: '+24.0%', icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Welcome back, <span className="font-semibold text-slate-800">{user?.name || 'Administrator'}</span>. Here is your platform's operational performance.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Cluster Online</span>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-md p-5 transition-colors hover:border-slate-300"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">{s.title}</span>
                <div className="p-2 rounded-md bg-slate-50 text-[#2A3B5C]">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  {s.value}
                </span>
                <span className="inline-flex items-center text-xs font-bold text-emerald-600">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  {s.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Security Architecture Callout */}
      <div className="bg-white border border-slate-200 rounded-md p-5 flex items-start gap-3.5">
        <div className="p-2 rounded-md bg-indigo-50 text-indigo-600 shrink-0 mt-0.5">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="text-xs text-slate-600 leading-relaxed">
          <p className="font-bold text-slate-900 mb-1">
            Private Admin Gateway Active
          </p>
          <p>
            Admin routes are strictly guarded by role-based authorization (<code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-700 font-mono text-[11px]">ADMIN</code>). Self-registration is restricted exclusively to the customer storefront.
          </p>
        </div>
      </div>
    </div>
  );
}
