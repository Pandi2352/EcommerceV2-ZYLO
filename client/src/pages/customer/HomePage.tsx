import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Terminal,
  User,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import CustomerLayout from '../../components/layout/CustomerLayout';

export default function CustomerHomePage() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'packages'>('overview');

  const packages = [
    { name: 'React', version: '^19.3.0', role: 'UI Framework' },
    { name: 'TypeScript', version: '~6.0.2', role: 'Static Typing' },
    { name: 'Vite', version: '^8.3.1', role: 'Build Tool & HMR' },
    { name: 'Tailwind CSS', version: '^4.3.3', role: '@tailwindcss/vite Plugin' },
    { name: 'React Router DOM', version: '^7.18.4', role: 'Declarative Routing' },
    { name: 'Axios', version: '^1.20.0', role: 'HTTP Client' },
    { name: 'Lucide React', version: '^1.49.0', role: 'Icons' },
  ];

  return (
    <CustomerLayout showRail={true}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
        {/* Active Auth Callout */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-md p-5 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-indigo-950">
                Phase 1 Active: Customer Authentication & Registration
              </p>
              <p className="text-xs text-indigo-800 mt-0.5">
                {isAuthenticated && user
                  ? `Authenticated as ${user.name} (${user.email}). Session stored in secure HttpOnly cookies.`
                  : 'Backend AuthModule is live with MongoDB UUID v4 schemas. Try creating a customer account!'}
              </p>
            </div>
          </div>
          {!isAuthenticated && (
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white transition-colors self-start sm:self-auto"
            >
              <span>Customer Registration</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {/* Banner Card */}
        <section className="bg-white border border-slate-200 rounded-md p-6 sm:p-8 mb-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100 mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Storefront Customer Experience
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              ZYLO — Modern E-Commerce Platform
            </h1>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              Clean architecture built with React 19, Vite, Tailwind CSS v4, NestJS 12, and MongoDB with UUID v4 primary keys.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="mt-6 flex items-center gap-2 border-b border-slate-200 pb-3">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              System Status
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('packages')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                activeTab === 'packages'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Installed Packages ({packages.length})
            </button>
          </div>

          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
                <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                  <Terminal className="w-4 h-4 text-indigo-600" />
                  Backend Engine
                </div>
                <p className="text-xs text-slate-600 mt-1">NestJS 12 + MongoDB + UUID v4 BaseSchema</p>
                <div className="mt-3 inline-block text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  AuthModule Live
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
                <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  Styling System
                </div>
                <p className="text-xs text-slate-600 mt-1">Tailwind CSS v4 with modern @import syntax</p>
                <div className="mt-3 inline-block text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  Active (No shadows, rounded-md)
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
                <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  Session Security
                </div>
                <p className="text-xs text-slate-600 mt-1">Dual JWT in HttpOnly cookies + Passport.js</p>
                <div className="mt-3 inline-block text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                  Ready & Verified
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Packages List */}
          {activeTab === 'packages' && (
            <div className="mt-6 border border-slate-200 rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-semibold">Package Name</th>
                    <th className="px-4 py-2.5 text-left font-semibold">Installed Version</th>
                    <th className="px-4 py-2.5 text-left font-semibold">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {packages.map((pkg) => (
                    <tr key={pkg.name}>
                      <td className="px-4 py-2 font-medium text-slate-900">{pkg.name}</td>
                      <td className="px-4 py-2 font-mono text-slate-600">{pkg.version}</td>
                      <td className="px-4 py-2 text-slate-600">{pkg.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Status Callout Box */}
        <div className="bg-white border border-slate-200 rounded-md p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <div>
              <p className="text-xs font-bold text-slate-900">System Ready for Customer Onboarding</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Register endpoint validates password strength, uniqueness, and dispatches HttpOnly JWT cookies.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
            <CheckCircle2 className="w-4 h-4" />
            <span>Operational</span>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
